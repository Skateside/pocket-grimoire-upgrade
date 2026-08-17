<?php

namespace App\Service;

use Symfony\Component\Yaml\Yaml;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class Storage
{
    /**
     * @var int Remove all files using Storage::rmdir()
     */
    const REMOVE_FILES = 1;

    /**
     * @var int Remove the reference to the location using Storage::rmdir()
     */
    const REMOVE_REFERENCE = 2;

    /**
     * @var int Remove all files using Storage::rmdir()
     */
    const REMOVE_ALL = Storage::REMOVE_FILES | Storage::REMOVE_REFERENCE;

    /**
     * @param array<string, string> $locations Location directories.
     */
    public function __construct(

        #[Autowire('%kernel.project_dir%')]
        private string $projectDir,

        protected $locations = [],

    ) {
        $configFile = static::concat($projectDir, 'config', 'storage.yaml');
        $config = Yaml::parseFile($configFile);

        foreach ($config as $id => $path) {
            $this->locations[$id] = str_replace('/', DIRECTORY_SEPARATOR, $path);
        }
    }

    /**
     * Helper function for concatenating directory paths.
     *
     * @param string ...$parts Parts to concatenate together.
     * @return string Concatenated path.
     */
    public static function concat(string ...$parts): string
    {
        return implode(DIRECTORY_SEPARATOR, $parts);
    }

    /**
     * Gets the real path of the location requested.
     *
     * @param string $locationId ID of the location to access.
     * @return string Real path.
     */
    public function getRealpath(string $locationId): string
    {
        if (!array_key_exists($locationId, $this->locations)) {
            throw new \Exception("Can't find '{$locationId}' location", E_USER_ERROR);
        }

        return static::concat($this->projectDir, $this->locations[$locationId]);
    }

    /**
     * Helper function for getting the full file name for the file in the given
     * location.
     *
     * @param string $locationId ID of the location.
     * @param string ...$parts Parts to create the file name.
     * @return string Full file name.
     */
    public function getFilename(string $locationId, string ...$parts): string
    {
        return static::concat($this->getRealpath($locationId), ...$parts);
    }

    /**
     * Reads the contents of the file at the given location.
     *
     * @param string $locationId ID of the location where the file is located.
     * @param string ...$parts Parts of the file name to read.
     * @return string|false The contents of the file or false on an error.
     */
    public function read(string $locationId, string ...$parts): mixed
    {
        return file_get_contents($this->getFilename($locationId, ...$parts));
    }

    /**
     * Reads the contents of the file at the given location as JSON.
     *
     * @param string $locationId ID of the location where the file is located.
     * @param string ...$parts Parts of the file location.
     * @return mixed JSON data.
     */
    public function readJson(string $locationId, string ...$parts): mixed
    {
        return json_decode($this->read($locationId, ...$parts), true);
    }

    /**
     * Reads the contents of the file at the given location as YAML.
     *
     * @param string $locationId ID of the location where the file is located.
     * @param string ...$parts Parts of the file location.
     * @return mixed YAML data.
     */
    public function readYaml(string $locationId, string ...$parts): mixed
    {
        return Yaml::parse($this->read($locationId, ...$parts));
    }

    /**
     * Makes the directory at the given location ID. Optionally, the directory
     * permissions can be set.
     *
     * @param string $locationId ID of the location to create.
     * @param int $permissions Permissions for the directory.
     * @return bool true if the directory was created (or already exists),
     * false on an error.
     */ 
    public function mkdir(string $locationId, int $permissions = 0664): bool
    {
        $fullPath = $this->getRealpath($locationId);
        $done = true;

        if (!is_dir($fullPath)) {
            $done = mkdir($fullPath, $permissions, true);
        }

        return $done;
    }

    /**
     * Creates a directory that should be temporary.
     *
     * @param string $locationId ID of the location where the temporary
     * directory should be created.
     * @param string $directory Name of the directory to create.
     * @param int $permissions Permissions for the temporary directory.
     * @return string|bool The directory on success or false on failure.
     */
    public function mktmpdir(
        string $locationId,
        string $directory,
        int $permissions = 0664,
    ): string|bool {
        if (array_key_exists($directory, $this->locations)) {
            return false;
        }

        $fullPath = static::concat($this->getRealpath($locationId), $directory);

        if (!is_dir($fullPath) && !mkdir($fullPath, $permissions, true)) {
            return false;
        }

        $realPath = str_replace($this->projectDir, '', $fullPath);

        if (str_starts_with($realPath, DIRECTORY_SEPARATOR)) {
            $realPath = substr($realPath, strlen(DIRECTORY_SEPARATOR));
        }

        $this->locations[$directory] = $realPath;

        return $realPath;
    }

    /**
     * Removes a directory. Optionally, the directory can be emptied before
     * being removed and/or the reference to the directory can be removed.
     *
     * @param string $locationId ID of the location to remove.
     * @param int $mode Mode for the removal.
     * @return bool true on success, false on failure.
     */
    public function rmdir(string $locationId, int $mode = 0): bool
    {
        $realPath = $this->getRealpath($locationId);

        if (($mode & static::REMOVE_FILES) !== 0) {
            $iterator = new \RecursiveDirectoryIterator(
                $realPath,
                \RecursiveDirectoryIterator::SKIP_DOTS,
            );
            $files = new \RecursiveIteratorIterator(
                $iterator,
                \RecursiveIteratorIterator::CHILD_FIRST,
            );

            foreach ($files as $file) {
                if ($file->isDir()) {
                    rmdir($file->getPathname());
                } else {
                    unlink($file->getPathname());
                }
            }
        }

        if (!rmdir($realPath)) {
            return false;
        }

        if (($mode & static::REMOVE_REFERENCE) !== 0) {
            unset($this->locations[$locationId]);
        }

        return true;
    }

    /**
     * Wrapper for file_put_contents()
     *
     * @param string $locationId ID of the location to write to.
     * @param string $filename Name of the file to write.
     * @param string $data Contents of the file to write.
     * @param int $flags Optional flags.
     * @return int|false Either the number of bytes written or false on an error.
     */
    public function write(
        string $locationId,
        string $filename,
        string $data,
        int $flags = 0,
    ): mixed {
        if ($this->mkdir($locationId, 0744) === false) { // 0775
            throw new \Exception("Can't create '{$locationId}' directory");
        }

        $path = $this->getFilename($locationId, $filename);

        return file_put_contents($path, $data, $flags);
    }

    /**
     * Helper function for writing JSON to a file.
     *
     * @param string $locationId ID of the location to write to.
     * @param string $filename Name of the file to write.
     * @param mixed $data JSON to encode and write.
     * @param int $jsonFlags Optional flags for writing JSON.
     * @param int $flags Optional flags for writing the file.
     * @return int|false Either the number of bytes written or false on an error.
     */
    public function writeJson(
        string $locationId,
        string $filename,
        mixed $data,
        int $jsonFlags = 0,
        int $flags = 0,
    ): mixed {
        return $this->write($locationId, $filename, json_encode($data, $jsonFlags), $flags);
    }

    /**
     * Checks to see if the given file exists.
     *
     * @param string $locationId ID of the location of the file.
     * @param string ...$parts Parts of the file location.
     * @return bool true if the file exists, false if it doesn't.
     */
    public function exists(string $locationId, string ...$parts): bool
    {
        return file_exists($this->getFilename($locationId, ...$parts));
    }

    /**
     * Gets an array of file names from the given location. Optionally the
     * file names can be filtered by a filter function.
     *
     * @param string $locationId ID of the location.
     * @param ?(callable(string): bool) $filter Optional filter for the file names.
     * @return bool|string[] Either the array of any (matching) file names or
     * false if there were any errors.
     */
    public function getFilenames(
        string $locationId,
        ?callable $filter = null,
    ): bool|array {
        $files = scandir($this->getRealpath($locationId));

        if ($files === false) {
            return false;
        }

        if (is_callable($filter)) {
            return array_filter($files, $filter);
        }

        return $files;
    }

    /**
     * Copies the given file in $from to the location in $to.
     *
     * @param string $from The source file.
     * @param string $to The destination location.
     * @return bool true if the copying was successful, false if it wasn't.
     */
    public function copyFile(string $from, string $to): bool
    {
        return copy($from, $to);
    }

    /**
     * Processes the contents of a zip file by extracting the contents into a
     * temporary directory.
     *
     * @param string $zipLocation Location of the zip file whose contents should
     * be processed.
     * @param callable(\SplFileInfo): void $process Processing function.
     * @return bool true if everything is successful, false if there's an error.
     */
    public function processZip(string $zipLocation, callable $process): bool
    {
        $id = uniqid('tmpdir_');
        $tempDir = $this->mktmpdir('tmp', $id, 0744);
        $tempZip = uniqid('tmpzip_') . '.zip';
        $fullZip = static::concat($this->getRealpath('tmp'), $tempZip);

        if (!$this->copyFile($zipLocation, $fullZip)) {
            return false;
        }

        $zip = new \ZipArchive();
        $result = $zip->open($fullZip);

        if ($result !== true) {
            return false;
        }

        $zip->extractTo($tempDir);
        $zip->close();

        $iterator = new \RecursiveDirectoryIterator(
            $tempDir,
            \RecursiveDirectoryIterator::SKIP_DOTS,
        );
        $files = new \RecursiveIteratorIterator(
            $iterator,
            \RecursiveIteratorIterator::CHILD_FIRST,
        );

        foreach ($files as $file) {
            if ($file->isFile()) {
                $process($file);
            }
        }

        unlink($fullZip);

        return $this->rmdir($id, static::REMOVE_ALL);
    }
}


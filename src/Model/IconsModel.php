<?php

namespace App\Model;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use App\Enums\RoleTeamEnums;
use RecursiveDirectoryIterator;
use ZipArchive;

class IconsModel
{
    /**
     * @var string Colour representing the good team in the SVG files.
     */
    const COLOUR_GOOD = '#0000FF';

    /**
     * @var string Colour representing the evil team in the SVG files.
     */
    const COLOUR_EVIL = '#FF0000';

    /**
     * @var string Directory where role default SVGs will be stored.
     */
    const DIRECTORY_DESTINATION = 'roles';

    /**
     * @var Directory where role alternative SVGs will be stored.
     */
    const DIRECTORY_ALTERNATIVE = 'alternative';

    /**
     * @var string URL of the zip file containing the raw SVG files.
     */
    const URL_ZIP = 'https://github.com/tomozbot/botc-icons/archive/refs/heads/main.zip';

    public function __construct(

        #[Autowire('%kernel.project_dir%/var')]
        private string $varDirectory,

        #[Autowire('%kernel.project_dir%/public')]
        private string $publicDirectory,

        #[Autowire('%kernel.project_dir%/assets/images/roles')]
        private string $assetsDirectory,

    )
    {}

    /**
     * Copies the SVG files for the "special" roles (meta, dawn, demon info
     * etc.) into the destination directory.
     *
     * @return bool `true` on success, `false` if anything failed.
     */
    public function copyIcons(): bool
    {
        $files = scandir($this->assetsDirectory);
        
        if ($files === false) {
            return false;
        }

        $directories = $this->getDirectories();

        if (!$this->writeDirectory($directories->destination)) {
            return false;
        }

        $icons = array_filter($files, function ($file) {
            return str_ends_with($file, '.svg');
        });

        foreach ($icons as $icon) {
            if (!copy(
                $this->assetsDirectory . DIRECTORY_SEPARATOR . $icon,
                $directories->destination . DIRECTORY_SEPARATOR . $icon,
            )) {
                return false;
            }
        }

        return true;
    }

    /**
     * Fetches the SVGs from the remote zip file and processes them. An array
     * with a `success` boolean and `body` property is returned which describes
     * the success or any failure.
     *
     * @param array $roles Roles that should gain icons.
     * @return array Array with success/failure information.
     */
    public function fetchSVGs(array $roles): array
    {
        $directory = $this->fetchZip();

        if ($directory === false) {
            return ['success' => false, 'body' => 'Cannot download zip file'];
        }

        if (!$this->extractZip($directory)) {
            return ['success' => false, 'body' => 'Cannot extract zip file'];
        }

        $successful = 0;

        foreach ($roles as $role) {

            $svg = $this->getSVGContents($directory, $role['id']);

            if (
                $svg === false
                || $this->writeIcons($role['id'], $svg, $role['team']) === false
            ) {
                continue;
            }

            $successful += 1;

        }

        if (!$this->removeTmpDirectory($directory)) {
            ['success' => false, 'body' => 'Cannot remove temporary directory'];
        }

        return ['success' => true, 'body' => $successful];
    }

    /**
     * Fetches the zip file from the remote URL and put it into a temporary
     * directory. This function returns the directory or `false` on failure.
     *
     * @return string|false Either the directory where the zip file was placed
     * or `false` in the event of any failure.
     */
    protected function fetchZip(): string | false
    {
        $zip = fopen(static::URL_ZIP, 'r');

        if ($zip === false) {
            return false;
        }

        $folder = uniqid('botc-icons-' . date('Y-m-d') . '-');
        $directory = implode(DIRECTORY_SEPARATOR, [
            $this->varDirectory,
            'tmp',
            $folder,
        ]);

        if (!$this->writeDirectory($directory)) {
            return false;
        }

        if (file_put_contents(
            $directory . DIRECTORY_SEPARATOR . 'botc-icons.zip',
            $zip,
        ) === false) {
            return false;
        }

        return $directory;
    }

    /**
     * Extracts the contents of the zip file in the given directory to the same
     * directory. This function returns `true` on success and `false` in the
     * event of a failure.
     *
     * @param string $directory Directory where the zip file is located and
     * where the contents should be extracted.
     * @return bool `true` on success, `false` on failure.
     */
    protected function extractZip(string $directory): bool
    {
        $zip = new \ZipArchive();
        $result = $zip->open($directory . DIRECTORY_SEPARATOR . 'botc-icons.zip');

        if ($result !== true) {
            return false;
        }

        $zip->extractTo($directory);
        $zip->close();

        return true;
    }

    /**
     * Gets the contents of the SVG file in the given directory for the given
     * role ID. On success, the file contents are returned as a string; on
     * failure, `false` is returned.
     *
     * @param string $directory Directory where the zip files contents were
     * extracted.
     * @param string $roleId ID of the role whose SVG contents should be
     * returned.
     * @return string|false The contents of the SVG file on success, `false` on
     * failure.
     */
    protected function getSVGContents(
        string $directory,
        string $roleId,
    ): string | false
    {
        $svgDirectory = implode(
            DIRECTORY_SEPARATOR,
            [$directory, 'botc-icons-main', 'SVG'],
        );
        $svgFile = $svgDirectory . DIRECTORY_SEPARATOR . "{$roleId}.svg";

        if (is_dir($svgDirectory) && file_exists($svgFile)) {
            return file_get_contents($svgFile);
        }

        return false;
    }

    /**
     * Removes the given directory and all files within it.
     *
     * @param string $directory Directory to remove.
     * @return bool `true` on success, `false` on failure.
     */
    protected function removeTmpDirectory(string $directory): bool
    {
        $iterator = new \RecursiveDirectoryIterator(
            $directory,
            RecursiveDirectoryIterator::SKIP_DOTS,
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

        return rmdir($directory);
    }

    /**
     * Writes the icon and and alternatives into the destination directory.
     *
     * @param string $roleId ID of the role whose icons should be written.
     * @param string $svg Contents of the default SVG icon for the role.
     * @param string $roleTeam Team that the role belongs to (Townsfolk, Demon
     * etc.) - used to work out which alternatives should be created (if any).
     * @return bool `true` on success, `false` on failure.
     */
    protected function writeIcons(
        string $roleId,
        string $svg,
        string $roleTeam,
    ): bool
    {
        $directories = $this->getDirectories();

        if (!$this->writeDirectories($directories)) {
            return false;
        }

        if (!$this->writeFile(
            $directories->destination,
            "{$roleId}.svg",
            $svg,
        )) {
            return false;
        }

        switch ($roleTeam) {
            case RoleTeamEnums::TOWNSFOLK->value:
            case RoleTeamEnums::OUTSIDER->value:

                if (!$this->writeFile(
                    $directories->alternative,
                    "{$roleId}.svg",
                    $this->convertSVGToEvil($svg),
                )) {
                    return false;
                }

                break;

            case RoleTeamEnums::MINION->value:
            case RoleTeamEnums::DEMON->value:

                if (!$this->writeFile(
                    $directories->alternative,
                    "{$roleId}.svg",
                    $this->convertSVGToGood($svg),
                )) {
                    return false;
                }

                break;

            case RoleTeamEnums::TRAVELLER->value:

                if (!$this->writeFile(
                    $directories->alternative,
                    "{$roleId}_g.svg",
                    $this->convertSVGToGood($svg),
                )) {
                    return false;
                }

                if (!$this->writeFile(
                    $directories->alternative,
                    "{$roleId}_e.svg",
                    $this->convertSVGToEvil($svg),
                )) {
                    return false;
                }

                break;
        }

        return true;
    }

    /**
     * Gets the destination and alternative directories.
     *
     * @return object Directories (`destination` and `alternative`).
     */
    protected function getDirectories(): object
    {
        $destinationDirectory = (
            $this->publicDirectory
            . DIRECTORY_SEPARATOR
            . static::DIRECTORY_DESTINATION
        );
        $alternativeDirectory = (
            $destinationDirectory
            . DIRECTORY_SEPARATOR
            . static::DIRECTORY_ALTERNATIVE
        );

        return (object) [
            'destination' => $destinationDirectory,
            'alternative' => $alternativeDirectory,
        ];
    }

    /**
     * Writes the directories.
     *
     * @param object $directories Directories to write.
     * @return bool `true` on success, `false` on failure.
     */
    protected function writeDirectories(object $directories): bool
    {
        if (
            !$this->writeDirectory($directories->destination)
            || !$this->writeDirectory($directories->alternative)
        ) {
            return false;
        }

        return true;
    }

    /**
     * Writes the directory at the given location if it needs to.
     *
     * @return `true` if the directory was written or already existed, `false`
     * on failure.
     */
    protected function writeDirectory($directory): bool
    {
        if ((!is_dir($directory) && !mkdir($directory, 0744, true))) {
            return false;
        }

        return true;
    }

    /**
     * Writes the file at the given location with the given contents.
     *
     * @param string $directory Directory where the file should be written.
     * @param string $filename File name to write.
     * @param string $contents Contents of the file to write.
     * @return bool `true` on success, `false` on failure.
     */
    protected function writeFile($directory, $filename, $contents): bool
    {
        if (file_put_contents(
            $directory . DIRECTORY_SEPARATOR . $filename,
            $contents,
        ) === false) {
            return false;
        }

        return true;
    }

    /**
     * Converts a good SVG icon into an evil one.
     *
     * @param string $svg SVG string to convert.
     * @return string Converted SVG.
     */
    protected function convertSVGToGood(string $svg): string
    {
        return str_ireplace(static::COLOUR_EVIL, static::COLOUR_GOOD, $svg);
    }

    /**
     * Converts an evil SVG icon into a good one.
     *
     * @param string $svg SVG string to convert.
     * @return string Converted SVG.
     */
    protected function convertSVGToEvil(string $svg): string
    {
        return str_ireplace(static::COLOUR_GOOD, static::COLOUR_EVIL, $svg);
    }
}

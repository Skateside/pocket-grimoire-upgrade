<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Helper\ProgressIndicator;
use App\Model\{
    IconsModel,
    TPIResourcesModel,
};
use App\Enums\RoleIdEnums;
use App\Service\{
    Fetch,
    Storage,
};

#[AsCommand(
    name: 'pocket-grimoire:fetch-icons',
    description: 'Fetch the icons from the "botc-icons" repository',
)]
class FetchIconsCommand
{
    /**
     * @var string URL of the zip file containing the raw SVG files.
     */
    const URL_ZIP = 'https://github.com/tomozbot/botc-icons/archive/refs/heads/main.zip';

    /**
     * @var string LOCATION_SPECIAL_ICONS Key for the location of the special icons.
     */
    const LOCATION_SPECIAL_ICONS = 'special-role-icons';

    /**
     * @var string LOCATION_DESTINATIONS Key for the destination of the icons.
     */
    const LOCATION_DESTINATION = 'role-icons-destination';

    /**
     * @var string LOCATION_ALTERNATIVE Key for the destination of the icon alternatives.
     */
    const LOCATION_ALTERNATIVE = 'role-icons-alternative';

    public function __construct(
        private IconsModel $iconsModel,
        private TPIResourcesModel $resourcesModel,
        private Fetch $fetch,
        private Storage $storage,
    ) {
        $this->iconsModel = $iconsModel;
        $this->resourcesModel = $resourcesModel;
        $this->fetch = $fetch;
        $this->storage = $storage;
    }

    public function __invoke(
        SymfonyStyle $io,
        OutputInterface $output,
    ): int
    {
        if ($io->isVerbose()) {
            $io->title('Fetching Icons');
        }

        if ($io->isVerbose()) {
            $io->section('Copying icons');
        }

        if (!$this->copyIcons()) {
            $io->getErrorStyle()->warning('Failed to copy icons');
        } elseif ($io->isVerbose()) {
            $io->writeln('Icons copied successfully');
        }

        $indicator = null;

        if ($io->isVerbose()) {
            $io->section('Downloading icons');
            $indicator = new ProgressIndicator($output);
            $indicator->start('Downloading ...');
        }

        $files = $this->fetchSVGContents(
            function (int $downloaded, ?int $total) use ($indicator) {
                if (!is_null($indicator)) {
                    $indicator->advance();
                }
            },
        );

        if ($io->isVerbose()) {
            $indicator->finish('Downloaded SVGs');
        }

        if (is_string($files)) {
            $io->getErrorStyle()->error($files);
            return Command::FAILURE;
        }

        $data = $this->storage->readJson('raw', 'fetched-roles.json');
        $specialRoleIds = [
            RoleIdEnums::DAWN->value,
            RoleIdEnums::DEMON_INFO->value,
            RoleIdEnums::DUSK->value,
            RoleIdEnums::META->value,
            RoleIdEnums::MINION_INFO->value,
            RoleIdEnums::NO_ROLE->value,
            RoleIdEnums::UNIVERSAL->value,
            RoleIdEnums::UNRECOGNISED->value,
        ];
        $roles = array_filter($data, function ($role) use($specialRoleIds) {
            return !in_array($role['id'], $specialRoleIds);
        });
        $total = count($roles);
        $linked = $this->linkRolesAndIcons($roles, $files);

        if ($total !== $linked) {
            $missing = $total - $linked;
            $io->getErrorStyle()->warning("{$missing} icons failed to copy");
        }

        $io->getErrorStyle()->success('Icons downloaded and copied');
        return Command::SUCCESS;
    }

    /**
     * Copies the SVG files for the "special" roles (meta, dawn, demon info
     * etc.) into the destination directory.
     *
     * @return bool `true` on success, `false` if anything failed.
     */
    protected function copyIcons(): bool
    {
        if (!$this->storage->mkdir(static::LOCATION_DESTINATION, 0744)) {
            return false;
        }

        $icons = $this->storage->getFilenames(
            static::LOCATION_SPECIAL_ICONS,
            function (string $file) {
                return str_ends_with($file, '.svg');
            },
        );

        if ($icons === false) {
            return false;
        }

        foreach ($icons as $icon) {
            if (!$this->storage->copyFile(
                $this->storage->getFilename(static::LOCATION_SPECIAL_ICONS, $icon),
                $this->storage->getFilename(static::LOCATION_DESTINATION, $icon),
            )) {
                return false;
            }
        }

        return true;
    }

    /**
     * Fetches the SVG contents an returns an array. If there is an error, false
     * is returned.
     *
     * @return array<string, string>|stringEither an array of file names to file
     * contents or a string with an error message on error.
     */
    protected function fetchSVGContents(callable $onProgress): array|string
    {
        $tempZip = uniqid('tmpzip_') . '.zip';

        if (!$this->storage->touch('tmp', $tempZip, 0744)) {
            return 'Failed to create file/set permissions';
        }

        $fullZip = $this->storage->getFilename('tmp', $tempZip);
        $downloaded = $this->fetch->getFile(static::URL_ZIP, $fullZip, $onProgress);

        if (!$downloaded) {
            return $this->fetch->getLastError();
        }

        $files = [];

        $this->storage->processZip(
            $fullZip,
            function (\SplFileInfo $file) use (&$files) {
                $filename = $file->getFilename();

                if (str_ends_with($filename, '.svg')) {
                    $files[$filename] = file_get_contents($file->getRealPath());
                }
            },
        );

        $this->storage->rm('tmp', $tempZip);

        return $files;
    }

    /**
     * Loops through the roles and saves the related icons to them, saving the
     * SVGs where they need to be saved.
     *
     * @param array<string, string>[] $roles Roles whose icons should be saved.
     * @param array<string, string> $files Files that were downloaded.
     * @return int The number of roles that were processed.
     */
    protected function linkRolesAndIcons(array $roles, array $files): int
    {
        $successful = 0;

        foreach ($roles as $role) {
            $key = "{$role['id']}.svg";

            if (!array_key_exists($key, $files)) {
                continue;
            }

            $icons = $this->iconsModel->writeIcons($role['id'], $files[$key], $role['team']);

            foreach ($icons['base'] as $name => $contents) {
                $this->storage->write(static::LOCATION_DESTINATION, $name, $contents);
            }

            foreach ($icons['alt'] as $name => $contents) {
                $this->storage->write(static::LOCATION_ALTERNATIVE, $name, $contents);
            }

            $successful += 1;
        }

        return $successful;
    }
}

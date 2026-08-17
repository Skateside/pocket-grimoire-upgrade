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
use App\Service\Storage;

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
        private Storage $storage,
    ) {
        $this->iconsModel = $iconsModel;
        $this->resourcesModel = $resourcesModel;
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

        if ($io->isVerbose()) {
            $io->section('Downloading icons');
            $indicator = new ProgressIndicator($output);
            $indicator->start('Downloading ...');
        }

        $files = $this->fetchSVGContents();

        if ($io->isVerbose()) {
            $indicator->finish('Downloaded SVGs');
        }

        if ($files === false) {
            $io->getErrorStyle()->error('Failed to fetch SVGs');
            return Command::FAILURE;
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
     * @return array<string, string>|bool Either an array of file names to file
     * contents or false on an error.
     */
    protected function fetchSVGContents(): array|bool
    {
        $files = [];
        $result = $this->storage->processZip(
            static::URL_ZIP,
            function (\SplFileInfo $file) use (&$files) {
                $filename = $file->getFilename();

                if (str_ends_with($filename, '.svg')) {
                    $files[$filename] = file_get_contents($file->getRealPath());
                }
            },
        );

        if (!$result) {
            return false;
        }

        return $files;
    }

    /**
     * Fetches the SVGs from the remote zip file and processes them. An array
     * with a `success` boolean and `body` property is returned which describes
     * the success or any failure.
     *
     * @param array{id: string, team: string}[] $roles Roles that should gain icons.
     * @return array{success: bool, body: string|int} Array with success/failure information.
     */
    protected function fetchSVGs(array $roles): array
    {
        $files = [];
        $result = $this->storage->processZip(
            static::URL_ZIP,
            function (\SplFileInfo $file) use (&$files) {
                $filename = $file->getFilename();

                if (str_ends_with($filename, '.svg')) {
                    $files[$filename] = file_get_contents($file->getRealPath());
                }
            },
        );

        if (!$result) {
            return ['success' => false, 'body' => 'Zip processing failed'];
        }

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

        return ['success' => true, 'body' => $successful];
    }
}

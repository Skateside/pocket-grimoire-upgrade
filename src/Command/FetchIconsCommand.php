<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;
use App\Model\{
    IconsModel,
    TPIResourcesModel,
};
use App\Enums\RoleIdEnums;

#[AsCommand(
    name: 'pocket-grimoire:fetch-icons',
    description: 'Fetch the icons from the "botc-icons" repository',
)]
class FetchIconsCommand
{
    private $iconsModel;
    private $resourcesModel;

    public function __construct(
        IconsModel $iconsModel,
        TPIResourcesModel $resourcesModel,
    ) {
        $this->iconsModel = $iconsModel;
        $this->resourcesModel = $resourcesModel;
    }

    public function __invoke(
        SymfonyStyle $io,
    ): int
    {
        if ($io->isVerbose()) {
            $io->title('Fetching Icons');
        }

        if ($io->isVerbose()) {
            $io->section('Copying icons');
        }

        if (!$this->iconsModel->copyIcons()) {
            $io->getErrorStyle()->warning('Failed to copy icons');
        } elseif ($io->isVerbose()) {
            $io->writeln('Icons copied successfully');
        }

        $data = $this->resourcesModel->getData();
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
        }

        $results = $this->iconsModel->fetchSVGs($roles);

        if (!$results['success']) {
            $io->getErrorStyle()->warning('Problem fetching SVGs: ' . $results['body']);
        } elseif ($results['body'] < $total) {
            $missing = $total - $results['body'];
            $io->getErrorStyle()->warning("{$missing} icon(s) failed");
        }

        if ($io->isVerbose()) {
            $io->writeln('Icons downloaded');
        }

        $io->getErrorStyle()->success('Icons downloaded and copied');
        return Command::SUCCESS;
    }
}

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
        $failures = [];

        if ($io->isVerbose()) {
            $io->section('Fetching remote icons');
            $io->progressStart(count($roles));
        }

        foreach ($roles as $role) {

            $io->progressAdvance();
            $fetched = $this->iconsModel->fetchIcon($role['id']);

            if ($fetched === false) {
                $failures[] = [$role['id'], 'Not found'];
                continue;
            }

            if ($this->iconsModel->writeIcons(
                $role['id'],
                $fetched,
                $role['team'],
            ) === false) {
                $failures[] = [$role['id'], 'Not written'];
                continue;
            }

        }

        $count = count($failures);

        if ($count > 0) {

            if ($io->isVerbose()) {

                $io->section('Failures');
                $io->table(['Role ID', 'Reason'], $failures);

            } else {
                $io->getErrorStyle()->warning("Failed to fetch {$count} icon(s)");
            }

        } elseif ($io->isVerbose()) {
            $io->writeln('Remote icons fetched');
        }

        $io->getErrorStyle()->success('Icons downloaded and copied');
        return Command::SUCCESS;
    }
}

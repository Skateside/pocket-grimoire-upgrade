<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;

use App\Model\BotcResourcesModel;

#[AsCommand(
    name: 'pocket-grimoire:fetch-resources',
    description: 'Fetch the latest data from the BotC resources',
)]
class FetchResourcesCommand
{
    private $resourcesModel;

    public function __construct(
        BotcResourcesModel $resourcesModel,
    ) {
        $this->resourcesModel = $resourcesModel;
    }

    public function __invoke(
        SymfonyStyle $io,
    ): int
    {
        $io->title('Fetching resources');

        $io->section('Downloading');
        $io->progressStart(4);
        $special = $this->resourcesModel->getSpecialRoles();
        $io->progressAdvance();
        $roles = $this->resourcesModel->getJson(BotcResourcesModel::ROLES_URL);
        $io->progressAdvance();
        $jinxes = $this->resourcesModel->getJson(BotcResourcesModel::JINXES_URL);
        $io->progressAdvance();
        $nightsheet = $this->resourcesModel->getJson(BotcResourcesModel::NIGHTSHEET_URL);
        $io->progressFinish();

        $isValidRoles = $this->resourcesModel->isValidRoles($roles['body'] ?? null);
        $isValidJinxes = $this->resourcesModel->isValidJinxes($jinxes['body'] ?? null);
        $isValidNightsheet = $this->resourcesModel->isValidNightsheet($nightsheet['body'] ?? null);

        $io->section('Results');
        $io->table(
            ['Type', 'Found', 'Valid'],
            [
                [
                    'Special',
                    $special['success'] ? 'Yes' : "({$special['body']})",
                    '-',
                ],
                [
                    'Roles',
                    $roles['success'] ? 'Yes' : "({$roles['body']})",
                    $isValidRoles ? 'Yes' : 'No',
                ],
                [
                    'Jinxes',
                    $jinxes['success'] ? 'Yes' : "({$jinxes['body']})",
                    $isValidJinxes ? 'Yes' : 'No',
                ],
                [
                    'Nightsheet',
                    $nightsheet['success'] ? 'Yes' : "({$nightsheet['body']})",
                    $isValidNightsheet ? 'Yes' : 'No',
                ],
            ]
        );

        if (!$isValidRoles) {
            $io->section('Roles not valid');
            $io->text($this->resourcesModel->getMessage());
        }

        if (!$isValidRoles || !$isValidJinxes || !$isValidNightsheet) {
            $io->getErrorStyle()->error('Data not valid, cannot continue');
            return Command::FAILURE;
        }

        $io->getErrorStyle()->success('Data downloaded');
        return Command::SUCCESS;
    }
}

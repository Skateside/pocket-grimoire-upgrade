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
        $rawSpecials = $this->resourcesModel->getSpecialRoles();
        $io->progressAdvance();
        $rawRoles = $this->resourcesModel->getJson(BotcResourcesModel::ROLES_URL);
        $io->progressAdvance();
        $rawJinxes = $this->resourcesModel->getJson(BotcResourcesModel::JINXES_URL);
        $io->progressAdvance();
        $rawNightsheet = $this->resourcesModel->getJson(BotcResourcesModel::NIGHTSHEET_URL);
        $io->progressFinish();

        if (
            !$rawSpecials['success']
            || !$rawRoles['success']
            || !$rawJinxes['success']
            || !$rawNightsheet['success']
        ) {
            $io->getErrorStyle()->error('Data not valid, cannot continue');
            return Command::FAILURE;
        }

        $specials = $this->resourcesModel->filterSpecials($rawSpecials['body']);
        $roles = $this->resourcesModel->filterRoles($rawRoles['body']);
        $jinxes = $this->resourcesModel->filterJinxes($rawJinxes['body']);
        $nightsheet = $this->resourcesModel->filterNightsheet($rawNightsheet['body']);

        $io->section('Results');
        $io->table(
            ['Type', 'Raw entries', 'Filtered entries'],
            [
                ['Special', count($rawSpecials['body']), count($specials)],
                ['Roles', count($rawRoles['body']), count($roles)],
                ['Jinxes', count($rawJinxes['body']), count($jinxes)],
                ['Nightsheet', count($rawNightsheet['body']), count($nightsheet)],
            ]
        );

        if (
            count($rawSpecials['body']) !== count($specials)
            || count($rawRoles['body']) !== count($roles)
            || count($rawJinxes['body']) !== count($jinxes)
            || count($rawNightsheet['body']) !== count($nightsheet)
        ) {
            $io->getErrorStyle()->warning('Some filtering occurred');
        }

        $combined = $this->resourcesModel->combineData(
            $specials,
            $roles,
            $jinxes,
            $nightsheet,
        );

        if (!$this->resourcesModel->writeData($combined)) {
            $io->getErrorStyle()->error('Failed to write data');
            return Command::FAILURE;
        }

        $io->getErrorStyle()->success('Data downloaded and written');
        return Command::SUCCESS;
    }
}

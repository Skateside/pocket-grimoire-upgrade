<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;
use App\Model\TPIResourcesModel;

#[AsCommand(
    name: 'pocket-grimoire:fetch-resources',
    description: 'Fetch the latest data from the BotC resources',
)]
class FetchResourcesCommand
{
    private $resourcesModel;

    public function __construct(
        TPIResourcesModel $resourcesModel,
    ) {
        $this->resourcesModel = $resourcesModel;
    }

    public function __invoke(
        SymfonyStyle $io,
    ): int
    {
        if ($io->isVerbose()) {
            $io->title('Fetching Resources');
        }

        if ($io->isVerbose()) {
            $io->section('Downloading');
            $io->progressStart(5);
        }

        $rawSpecials = $this->resourcesModel->getLocale(TPIResourcesModel::FILENAME_SPECIAL_ROLES);

        if ($io->isVerbose()) {
            $io->progressAdvance();
        }

        $rawImages = $this->resourcesModel->getLocale(TPIResourcesModel::FILENAME_IMAGES);

        if ($io->isVerbose()) {
            $io->progressAdvance();
        }

        $rawRoles = $this->resourcesModel->getRemote(TPIResourcesModel::URL_ROLES);

        if ($io->isVerbose()) {
            $io->progressAdvance();
        }

        $rawJinxes = $this->resourcesModel->getRemote(TPIResourcesModel::URL_JINXES);

        if ($io->isVerbose()) {
            $io->progressAdvance();
        }

        $rawNightsheet = $this->resourcesModel->getRemote(TPIResourcesModel::URL_NIGHTSHEET);

        if ($io->isVerbose()) {
            $io->progressFinish();
        }

        if (
            !$rawSpecials['success']
            || !$rawImages['success']
            || !$rawRoles['success']
            || !$rawJinxes['success']
            || !$rawNightsheet['success']
        ) {
            $io->getErrorStyle()->error('Data not valid');
            return Command::FAILURE;
        }

        $specials = $this->resourcesModel->filterSpecials($rawSpecials['body']);
        $images = $this->resourcesModel->filterImages($rawImages['body']);
        $roles = $this->resourcesModel->filterRoles($rawRoles['body']);
        $jinxes = $this->resourcesModel->filterJinxes($rawJinxes['body']);
        $nightsheet = $this->resourcesModel->filterNightsheet($rawNightsheet['body']);

        if ($io->isVerbose()) {

            $io->section('Results');
            $io->table(
                ['Type', 'Raw entries', 'Filtered entries'],
                [
                    ['Special', count($rawSpecials['body']), count($specials)],
                    ['Images', count($rawImages['body']), count($images)],
                    ['Roles', count($rawRoles['body']), count($roles)],
                    ['Jinxes', count($rawJinxes['body']), count($jinxes)],
                    ['Nightsheet', count($rawNightsheet['body']), count($nightsheet)],
                ]
            );

        }

        if (
            count($rawSpecials['body']) !== count($specials)
            || count($rawImages['body']) !== count($images)
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
            $images,
        );

        if (!$this->resourcesModel->writeData($combined, $io->isVerbose())) {
            $io->getErrorStyle()->error('Failed to write data');
            return Command::FAILURE;
        }

        $io->getErrorStyle()->success('Data downloaded and written');
        return Command::SUCCESS;
    }
}

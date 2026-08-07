<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;
use App\Model\TPIResourcesModel;
use App\Service\Fetch;
use App\Service\Storage;

#[AsCommand(
    name: 'pocket-grimoire:fetch-resources',
    description: 'Fetch the latest data from the BotC resources',
)]
class FetchResourcesCommand
{
    public function __construct(
        private TPIResourcesModel $resourcesModel,
        private Fetch $fetch,
        private Storage $storage,
    ) {
        $this->resourcesModel = $resourcesModel;
        $this->fetch = $fetch;
        $this->storage = $storage;
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

        $rawSpecials = $this->storage->readJson('raw', 'special-roles.json');

        if ($io->isVerbose()) {
            $io->progressAdvance();
        }

        $rawImages = $this->storage->readJson('raw', 'images.json');

        if ($io->isVerbose()) {
            $io->progressAdvance();
        }

        $config = $this->storage->readYaml('config', 'fetch.yaml');
        $rawRoles = $this->fetch->getJson($config['roles']);

        if ($io->isVerbose()) {
            $io->progressAdvance();
        }

        $rawJinxes = $this->fetch->getJson($config['jinxes']);

        if ($io->isVerbose()) {
            $io->progressAdvance();
        }

        $rawNightsheet = $this->fetch->getJson($config['nightsheet']);

        if ($io->isVerbose()) {
            $io->progressFinish();
        }

        if (
            $rawSpecials === null
            || $rawImages === null
            || !$rawRoles['success']
            || !$rawJinxes['success']
            || !$rawNightsheet['success']
        ) {
            $io->getErrorStyle()->error('Data not valid');
            return Command::FAILURE;
        }

        $specials = $this->resourcesModel->filterSpecials($rawSpecials);
        $images = $this->resourcesModel->filterImages($rawImages);
        $roles = $this->resourcesModel->filterRoles($rawRoles['body']);
        $jinxes = $this->resourcesModel->filterJinxes($rawJinxes['body']);
        $nightsheet = $this->resourcesModel->filterNightsheet($rawNightsheet['body']);

        if ($io->isVerbose()) {

            $io->section('Results');
            $io->table(
                ['Type', 'Raw entries', 'Filtered entries'],
                [
                    ['Special', count($rawSpecials), count($specials)],
                    ['Images', count($rawImages), count($images)],
                    ['Roles', count($rawRoles['body']), count($roles)],
                    ['Jinxes', count($rawJinxes['body']), count($jinxes)],
                    ['Nightsheet', count($rawNightsheet['body']), count($nightsheet)],
                ]
            );

        }

        if (
            count($rawSpecials) !== count($specials)
            || count($rawImages) !== count($images)
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

        // if (!$this->resourcesModel->writeData($combined, $io->isVerbose())) {
        if (!$this->storage->writeJson(
            'raw',
            'fetched-roles.json',
            $combined,
            $io->isVerbose() ? JSON_PRETTY_PRINT : 0,
        )) {
            $io->getErrorStyle()->error('Failed to write data');
            return Command::FAILURE;
        }

        $io->getErrorStyle()->success('Data downloaded and written');
        return Command::SUCCESS;
    }
}

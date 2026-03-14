<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;

use App\Model\LocalesDataModel;
use App\Model\TPIResourcesModel;

#[AsCommand(
    name: 'pocket-grimoire:extract-english',
    description: 'Extract the English locale from the fetched resources',
)]
class ExtractEnglishCommand
{
    private $localesDataModel;
    private $resourcesModel;

    public function __construct(
        LocalesDataModel $localesDataModel,
        TPIResourcesModel $resourcesModel,
    ) {
        $this->localesDataModel = $localesDataModel;
        $this->resourcesModel = $resourcesModel;
    }

    public function __invoke(
        SymfonyStyle $io,
    ): int
    {
        $io->title('Extracting English');

        if (($data = $this->resourcesModel->getData()) === null) {
            $io->getErrorStyle()->error('Unable to read fetched data');
            return Command::FAILURE;
        }

        $roles = $this->localesDataModel->extractRolesText($data);

        if (!count($roles)) {
            $io->getErrorStyle()->warning('No roles extracted');
        }

        if (!$this->localesDataModel->writeFile('en_GB', LocalesDataModel::ROLES, $roles)) {
            $io->getErrorStyle()->error('Failed to write roles data');
            return Command::FAILURE;
        }

        $jinxes = $this->localesDataModel->extractJinxes($data);

        if (!count($jinxes)) {
            $io->getErrorStyle()->warning('No jinxes extracted');
        }

        if (!$this->localesDataModel->writeFile('en_GB', LocalesDataModel::JINXES, $jinxes)) {
            $io->getErrorStyle()->error('Failed to write jinxes data');
            return Command::FAILURE;
        }

        $io->getErrorStyle()->success('English extracted and written');
        return Command::SUCCESS;
    }
}

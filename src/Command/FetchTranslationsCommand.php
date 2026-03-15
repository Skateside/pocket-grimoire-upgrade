<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;
use App\Model\TranslationsModel;

#[AsCommand(
    name: 'pocket-grimoire:fetch-translations',
    description: 'Fetch the latest data from the BotC translation repo',
)]
class FetchTranslationsCommand
{
    private $translationsModel;

    public function __construct(
        TranslationsModel $translationsModel,
    ) {
        $this->translationsModel = $translationsModel;
    }

    public function __invoke(
        SymfonyStyle $io,
    ): int
    {
        if ($io->isVerbose()) {
            $io->title('Compiling Translations');
        }

        $locales = [
            'de_DE' => 'de',
            'en_GB' => 'en',
            'fr_FR' => 'fr',
        ];

        if ($io->isVerbose()) {
            $io->progressStart(count($locales));
        }

        $hasError = false;
        $results = [];

        foreach ($locales as $filename => $remote) {

            $index = count($results);
            $results[$index] = [
                'locale' => $filename,
                'i18n' => 'No',
                'infoTokens' => 'No',
                'roles' => 'No',
                'scripts' => 'No',
                'written' => 'No',
            ];

            $data = [
                'i18n' => $this->translationsModel->getI18n($remote),
                'infoTokens' => $this->translationsModel->getInfoTokens($remote),
                'roles' => $this->translationsModel->getRoles($remote),
                'scripts' => $this->translationsModel->getScripts($remote),
            ];

            foreach ($data as $key => $datum) {
                if ($datum !== null) {
                    $results[$index][$key] = 'Yes';
                } else {
                    $hasError = true;
                }
            }

            if (
                !$hasError
                && $this->translationsModel->writeData(
                    $data,
                    $filename,
                    $io->isVerbose(),
                )
            ) {
                $results[$index]['written'] = 'Yes';
            } else {
                $hasError = true;
            }

            if ($io->isVerbose()) {
                $io->progressAdvance();
            }

        }

        if ($io->isVerbose()) {
            $io->progressFinish();
        }

        if ($io->isVerbose()) {

            $io->section('Results');
            $io->table(
                ['Locale', 'i18n', 'infoTokens', 'roles', 'scripts', 'Written'],
                $results,
            );

        }

        if ($hasError) {
            $io->getErrorStyle()->warning('Some locales failed to complete');
        }

        $io->getErrorStyle()->success('Files written');
        return Command::SUCCESS;
    }
}

<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;
use App\Model\TranslationsModel;
use App\Service\{
    Fetch,
    Storage,
};

#[AsCommand(
    name: 'pocket-grimoire:fetch-translations',
    description: 'Fetch the latest data from the BotC translation repo',
)]
class FetchTranslationsCommand
{
    /**
     * @var string URL (with placeholders) to get the remote data.
     */
    const URL_REMOTE = 'https://raw.githubusercontent.com/ThePandemoniumInstitute/botc-translations/refs/heads/main/%1$s/%2$s.json';

    public function __construct(
        private TranslationsModel $model,
        private Fetch $fetch,
        private Storage $storage,
    ) {
    }

    public function __invoke(
        SymfonyStyle $io,
    ): int
    {
        if ($io->isVerbose()) {
            $io->title('Compiling Translations');
        }

        // TODO: move this into a YAML file.
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

        $rawI18n = $this->storage->readJson('raw', 'i18n.json');
        $rawInfoTokens = $this->storage->readJson('raw', 'info-tokens.json');
        $rawRoles = $this->storage->readJson('raw', 'fetched-roles.json');
        $rawScripts = $this->storage->readJson('raw', 'scripts.json');

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

            $app = $this->fetch->getJson(sprintf(static::URL_REMOTE, 'app', $remote));
            $game = $this->fetch->getJson(sprintf(static::URL_REMOTE, 'game', $remote));

            $data = [
                'i18n' => $this->model->getI18n(
                    $rawI18n,
                    $app['grimoire'] ?? [],
                ),
                'infoTokens' => $this->model->getInfoTokens(
                    $rawInfoTokens,
                    $app['modals']['signal']['cards'] ?? [],
                ),
                'roles' => $this->model->getRoles(
                    $rawRoles,
                    $game ?? [],
                ),
                'scripts' => $this->model->getScripts(
                    $rawScripts,
                    $game ?? [],
                ),
            ];

            foreach ($data as $key => $datum) {
                if ($datum !== null) {
                    $results[$index][$key] = 'Yes';
                } else {
                    $hasError = true;
                }
            }


            if (!$hasError) {
                $text = 'Yes';
                $converted = $this->model->convertData(
                    $data,
                    $io->isVeryVerbose(),
                );

                if ($converted === false) {
                    $text = 'Conversion failed';
                    $hasError = true;
                } elseif (($this->storage->write(
                    'compiled',
                    "{$filename}.js",
                    $converted,
                )) === false) {
                    $text = 'Writing failed';
                    $hasError = true;
                }

                $results[$index]['written'] = $text;
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

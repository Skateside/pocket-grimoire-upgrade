<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;

use App\Model\TPIResourcesModel;
use App\Model\TranslationsModel;

#[AsCommand(
    name: 'pocket-grimoire:fetch-translations',
    description: 'Fetch the latest data from the BotC translation repo',
)]
class FetchTranslationsCommand
{
    private $resourcesModel;
    private $translationsModel;

    public function __construct(
        TPIResourcesModel $resourcesModel,
        TranslationsModel $translationsModel,
    ) {
        $this->resourcesModel = $resourcesModel;
        $this->translationsModel = $translationsModel;
    }

    public function __invoke(
        SymfonyStyle $io,
    ): int
    {
        $io->title('Fetching translations');

        // $locale = 'fr';

        // $i18n = $this->translationsModel->getI18n($locale);
        // $io->writeln(var_export($i18n, true));
        // $infoTokens = $this->translationsModel->getInfoTokens($locale);
        // $io->writeln(var_export($infoTokens, true));

        return Command::SUCCESS;
    }
}

/*
i18n: app/{locale}.json (note: these are in the format `singluar|plural`
{
    "townsfolk": grimoire.townsfolk,
    "outsider": grimoire.outsider,
    "minion": grimoire.minion,
    "demon": grimoire.demon,
    "traveller": grimoire.traveller,
    "fabled": grimoire.fabled,
    "loric": grimoire.loric,
}

Info tokens: app/{locale}.json
{
    "isdemon": modals.signal.cards.demon,
    "isminion": modals.signal.cards.minions,
    "notinplay": modals.signal.cards.bluffs,
    "nominatetoday": ~,
    "playeris": modals.signal.cards.claim,
    "votetoday": ~,
    "youare": modals.signal.cards.you,
    "selectedyou": modals.signal.cards.selected,
}
*/

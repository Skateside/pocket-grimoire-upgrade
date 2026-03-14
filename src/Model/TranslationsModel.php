<?php

namespace App\Model;

use Symfony\Component\DependencyInjection\Attribute\Autowire;

class TranslationsModel
{
    const REMOTE_URL = 'https://raw.githubusercontent.com/ThePandemoniumInstitute/botc-translations/refs/heads/main/%1$s/%2$s.json';
    const RAW_FOLDER = 'raw';
    const COMPILED_FOLDER = 'compiled';

    public function __construct(

        #[Autowire('%kernel.project_dir%/assets/data')]
        private string $dataDirectory,

        private array $remotes = [],

    )
    {}

    public function getInfoTokens(string $locale): ?array
    {
        $source = (
            $this->dataDirectory
            . DIRECTORY_SEPARATOR
            . static::RAW_FOLDER
            . DIRECTORY_SEPARATOR
            . 'info-tokens.json'
        );

        if (
            !file_exists($source)
            || ($contents = file_get_contents($source)) === false
            || !json_validate($contents)
            || ($json = json_decode($contents, true)) === false
        ) {
            return null;
        }

        foreach ($this->makeInfoTokens($locale) as $key => $translation) {
            $index = array_find_key($json, function ($item) use ($key) {
                return $item['id'] === $key;
            });

            if ($index !== false) {
                $json[$index]['markdown'] = $translation;
            }
        }

        return $json;
    }

    public function makeInfoTokens(string $locale): array
    {
        $app = $this->getRemote('app', $locale);
        $keys = [
            'isdemon' => 'demon',
            'isminion' => 'minions',
            'notinplay' => 'bluffs',
            'playeris' => 'claim',
            'youare' => 'you',
            'selectedyou' => 'selected',
        ];
        $infoTokens = [];

        foreach ($keys as $destination => $key) {
            if (
                $value = $app['modals']['signal']['cards'][$key] ?? null
                && is_string($value)
            ) {
                $infoTokens[$destination] = $value;
            }
        }

        return $infoTokens;
    }

    public function getI18n(string $locale): ?array
    {
        $source = (
            $this->dataDirectory
            . DIRECTORY_SEPARATOR
            . static::RAW_FOLDER
            . DIRECTORY_SEPARATOR
            . 'i18n.json'
        );

        if (
            !file_exists($source)
            || ($contents = file_get_contents($source)) === false
            || !json_validate($contents)
            || ($json = json_decode($contents, true)) === false
        ) {
            return null;
        }

        return array_merge($json, $this->makeI18n($locale));
    }

    public function makeI18n(string $locale): array
    {
        $app = $this->getRemote('app', $locale);
        $keys = [
            'townsfolk',
            'outsider',
            'minion',
            'demon',
            'traveller',
            'fabled',
            'loric',
        ];
        $i18n = [];

        foreach ($keys as $key) {
            if ($value = $this->getPlural($app['grimoire'] ?? null, $key)) {
                $i18n[$key] = $value;
            }
        }

        return $i18n;
    }

    protected function getPlural(?array $source, string $key): ?string
    {
        $divider = '|';

        if (
            !is_array($source)
            || !is_string($source[$key] ?? null)
            || ($index = strpos($source[$key], $divider)) === false
        ) {
            return null;
        }

        return substr($source[$key], $index + strlen($divider));
    }

    protected function getRemote(string $type, string $locale): ?array
    {
        if (!array_key_exists($locale, $this->remotes)) {
            $remotes = $this->fetchRemotes($locale);

            if ($remotes === null) {
                return null;
            }

            $this->remotes[$locale] = $remotes;
        }

        return $this->remotes[$locale][$type];
    }

    protected function fetchRemotes(string $locale): ?array
    {
        if (($app = $this->fetchRemote('app', $locale)) === null) {
            return null;
        }

        if (($game = $this->fetchRemote('game', $locale)) === null) {
            return null;
        }

        return [
            'app' => $app,
            'game' => $game,
        ];
    }

    protected function fetchRemote(string $type, string $locale): ?array
    {
        $url = sprintf(static::REMOTE_URL, $type, $locale);

        if (
            (($contents = file_get_contents($url)) === false)
            || !json_validate($contents)
        ) {
            return null;
        }

        return json_decode($contents, true);
    }
}

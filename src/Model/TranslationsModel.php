<?php

namespace App\Model;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use App\Model\TPIResourcesModel;
use App\Enums\{
    RoleIdEnums,
    RoleTeamEnums,
};

class TranslationsModel
{
    /**
     * @var string The official script author.
     * @todo Store this information in a better place.
     */
    const SCRIPT_AUTHOR = 'The Pandemonium Institute';

    public function __construct(
        private TPIResourcesModel $tpiResourcesModel,
    )
    {
    }

    /**
     * Gets the "i18n" data.
     *
     * @param ?array $json Source data, which might be null.
     * @param array<string, string> $grimoire Translated text (or null).
     * @return Either the "i18n" data or `null` if the source data was null.
     */
    public function getI18n(?array $json, array $grimoire): ?array
    {
        if (is_null($json)) {
            return null;
        }

        return array_merge($json, $this->makeI18n($grimoire));
    }

    /**
     * Gets the "info tokens" data.
     *
     * @param ?array $json Raw data, which might be null.
     * @param array<string, string> $cards Translations for the cards.
     * @return ?array Either the "info tokens" data or `null` if the given JSON
     *         data was null.
     */
    public function getInfoTokens(?array $json, array $cards): ?array
    {
        if (is_null($json)) {
            return null;
        }

        foreach ($this->makeInfoTokens($cards) as $key => $translation) {
            $index = array_find_key($json, function ($item) use ($key) {
                return $item['id'] === $key;
            });

            if ($index !== false) {
                $json[$index]['text'] = $translation;
            }
        }

        return $json;
    }

    /**
     * Gets the "roles" data.
     *
     * @param ?array $json Raw data, which might be null.
     * @param array<string, string> $game Game translations.
     * @return ?array Either the "roles" data or `null` if the given JSON data
     *         was null.
     */
    public function getRoles(?array $json, array $game): ?array
    {
        if (is_null($json)) {
            return null;
        }

        // TODO: Get extra roles (e.g. Chinese Community roles)
        $converted = $this->convertReminders($json, $game);
        $translation = $this->makeRoles($game);

        return array_map(function ($role) use ($translation) {

            $roleText = $translation['roles'][$role['id']] ?? [];

            if (is_string($roleText['name'] ?? null)) {
                $role['name'] = $roleText['name'];
            }

            if (is_string($roleText['ability'] ?? null)) {
                $role['ability'] = $roleText['ability'];
            }

            if (is_string($roleText['firstNightReminder'] ?? null)) {
                $role['firstNightReminder'] = $roleText['firstNightReminder'];
            }

            if (is_string($roleText['otherNightReminder'] ?? null)) {
                $role['otherNightReminder'] = $roleText['otherNightReminder'];
            }

            if (is_array($role['reminders'] ?? null)) {

                $role['reminders'] = array_map(function ($reminder) use ($translation) {

                    $reminder['name'] = (
                        $translation['reminders'][$reminder['name']]
                        ?? $reminder['name']
                    );

                    return $reminder;

                }, $role['reminders']);

            }

            if (
                is_array($role['jinxes'] ?? null)
                && array_key_exists($role['id'], $translation['jinxes'])
            ) {

                $role['jinxes'] = array_map(function ($jinx) use ($role, $translation) {

                    $reason = $translation['jinxes'][$role['id']][$jinx['id']] ?? null;

                    if (is_string($reason)) {
                        $jinx['reason'] = $reason;
                    }

                    return $jinx;

                }, $role['jinxes']);

            }

            return $role;

        }, $converted);
    }

    /**
     * Gets the "scripts" data.
     *
     * @param ?array $json Raw JSON data, which might be null.
     * @param array<string, string> $game Game translations.
     * @return ?array Either the "scripts" data or `null` if the given JSON data
     *         was null.
     */
    public function getScripts(?array $json, array $game): ?array
    {
        if (is_null($json)) {
            return null;
        }

        $translation = $this->makeScripts($game);

        foreach ($json as $key => $script) {

            if (!is_string($translation[$key] ?? null)) {
                continue;
            }

            $metaIndex = array_find_key($script, function ($item) {
                return (
                    is_array($item)
                    && ($item['id'] ?? null) === RoleIdEnums::META->value
                );
            });
            $metaEntry = $script[$metaIndex] ?? [
                'id' => RoleIdEnums::META->value,
            ];

            $metaEntry['name'] = $translation[$key];

            if (!is_string($metaEntry['author'] ?? null)) {
                $metaEntry['author'] = static::SCRIPT_AUTHOR;
            }

            if ($metaIndex === null) {
                array_unshift($script, $metaEntry);
            } else {
                $script[$metaIndex] = $metaEntry;
            }

            $json[$key] = $script;

        }

        return $json;
    }

    /**
     * Converts the given data into a JSON string so that it can be written to a
     * file.
     *
     * @param array<string, mixed> $data Data to convert.
     * @param bool $pretty true to format the JSON string, false to leave it
     *        unformatted.
     * @return string|bool Converted data or false on an error.
     */
    public function convertData(array $data, bool $pretty = false): string|bool
    {
        $json = json_encode($data, $pretty ? JSON_PRETTY_PRINT : 0);

        if ($json === false) {
            return false;
        }

        return "window.PG={$json}";
    }

    /**
     * Gets the translation information for the "i18n" data.
     *
     * @param array<string, string> $grimoire Translated text.
     * @return array Translation data.
     */
    protected function makeI18n(array $grimoire): array
    {
        $keys = [
            RoleTeamEnums::TOWNSFOLK->value,
            RoleTeamEnums::OUTSIDER->value,
            RoleTeamEnums::MINION->value,
            RoleTeamEnums::DEMON->value,
            RoleTeamEnums::TRAVELLER->value,
            RoleTeamEnums::FABLED->value,
            RoleTeamEnums::LORIC->value,
        ];
        $i18n = [];

        foreach ($keys as $key) {
            if ($value = $this->getPlural($grimoire, $key)) {
                $i18n[$key] = $value;
            }
        }

        return $i18n;
    }

    /**
     * Gets the translation information for the "info tokens" data.
     *
     * @param array<string, string> $cards Translations for the cards.
     * @return array Translation data.
     */
    protected function makeInfoTokens(array $cards): array
    {
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
            if (($value = $cards[$key] ?? null) && is_string($value)) {
                $infoTokens[$destination] = $value;
            }
        }

        return $infoTokens;
    }

    /**
     * Gets the translation information for the "roles" data.
     *
     * @param array $game Game translations.
     * @return array Translation data.
     */
    protected function makeRoles(array $game): array
    {
        $jinxes = [];

        foreach (($game['jinxes'] ?? []) as $id => $reason) {

            if (!is_string($reason)) {
                continue;
            }

            $idParts = explode('-', $id);

            // I think the jinxes should be this way around, but the data seems
            // to be the other way around. This seems like a bug to me, but
            // allowing both routes to the jinx reason ensures that we get it.

            if (!array_key_exists($idParts[0], $jinxes)) {
                $jinxes[$idParts[0]] = [];
            }

            $jinxes[$idParts[0]][$idParts[1]] = $reason;

            if (!array_key_exists($idParts[1], $jinxes)) {
                $jinxes[$idParts[1]] = [];
            }

            $jinxes[$idParts[1]][$idParts[0]] = $reason;

        }
        
        $reminders = [];
        
        foreach (($game['reminders'] ?? []) as $key => $reminder) {
            if (is_string($reminder)) {
                $reminders[$key] = $reminder;
            }
        }

        $roles = [];

        foreach (($game['roles'] ?? []) as $id => $translation) {

            $role = [];

            if (is_string($translation['name'] ?? null)) {
                $role['name'] = $translation['name'];
            }

            if (is_string($translation['ability'] ?? null)) {
                $role['ability'] = $translation['ability'];
            }

            if (is_string($translation['first'] ?? null)) {
                $role['firstNightReminder'] = (
                    $this->tpiResourcesModel->cleanNightReminder(
                        $translation['first'],
                    )
                );
            }

            if (is_string($translation['other'] ?? null)) {
                $role['otherNightReminder'] = (
                    $this->tpiResourcesModel->cleanNightReminder(
                        $translation['other'],
                    )
                );
            }

            if (count($role)) {
                $roles[$id] = $role;
            }

        }

        return [
            'jinxes' => $jinxes,
            'reminders' => $reminders,
            'roles' => $roles,
        ];
    }

    /**
     * Gets the translation information for the "scripts" data.
     *
     * @param array<string, string> $game Game translations.
     * @return array<string, string> Translation data.
     */
    protected function makeScripts(array $game): ?array
    {
        $scripts = [];

        foreach (($game['editions'] ?? []) as $key => $edition) {
            if (is_array($edition) && is_string($edition['name'] ?? null)) {
                $scripts[$key] = $edition['name'];
            }
        }

        return $scripts;
    }

    /**
     * Parses the data at the given source.
     *
     * @param string $source Location of the data to parse.
     * @return ?array The parsed data or `null` if anything went wrong (source
     * councouldn't be found, data couldn't be parsed, etc.)
     */
    protected function getJsonFromSource(string $source): ?array
    {
        if (
            !file_exists($source)
            || ($contents = file_get_contents($source)) === false
            || !json_validate($contents)
            || ($json = json_decode($contents, true)) === false
        ) {
            return null;
        }

        return $json;
    }

    /**
     * Converts the reminders on the given roles to use the keys rather than the
     * text, allowing them to be translated.
     *
     * @param array $roles Roles whose reminders should be converted.
     * @param array<string, mixed> $game Game translations.
     * @return array Roles with converted reminders.
     */
    protected function convertReminders(array $roles, array $game): array
    {
        $reminders = $this->getReminders($game);

        return array_map(function ($role) use ($reminders) {

            if (!array_key_exists('reminders', $role)) {
                return $role;
            }

            $role['reminders'] = array_map(function ($reminder) use ($reminders) {

                $reminder['name'] = (
                    $reminders[$reminder['name']]
                    ?? $reminder['name']
                );

                return $reminder;

            }, $role['reminders']);

            return $role;

        }, $roles);
    }

    /**
     * Gets the reminders from the English (master) remote source and returns
     * them in the format `text => key` to make converting them easier.
     *
     * @param array<string, mixed> $game Game translations.
     * @return array Reminder conversions.
     */
    protected function getReminders(array $game)
    {
        return array_flip($game['reminders'] ?? []);
    }

    /**
     * Gets the plural term.
     *
     * @param ?array $source Source containing the plurals.
     * @param string $key Type of polplural to return.
     * @param string $divider String separating the singular from the plural.
     * @return ?string The plural or `null` if anything went wrong.
     */
    protected function getPlural(
        ?array $source,
        string $key,
        string $divider = '|',
    ): ?string
    {
        if (
            !is_array($source)
            || !is_string($source[$key] ?? null)
            || ($index = strpos($source[$key], $divider)) === false
        ) {
            return null;
        }

        return substr($source[$key], $index + strlen($divider));
    }
}

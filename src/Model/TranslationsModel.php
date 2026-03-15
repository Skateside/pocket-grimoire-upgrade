<?php

namespace App\Model;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use App\Model\TPIResourcesModel;
use App\Enums\RoleEnums;

class TranslationsModel
{
    /**
     * @var string Directory where the comipled file(s) will be saved.
     */
    const DIRECTORY_COMPILED = 'compiled';

    /**
     * @var string Directory where the source files can be found.
     */
    const DIRECTORY_RAW = 'raw';

    /**
     * @var string Filename of the "i18n" data.
     */
    const FILENAME_I18N = 'i18n.json';

    /**
     * @var string Filename of the "info tokens" data.
     */
    const FILENAME_INFO_TOKENS = 'info-tokens.json';

    /**
     * @var string Filename of the "roles" data.
     */
    const FILENAME_ROLES = TPIResourcesModel::FILENAME_DESTINATION;

    /**
     * @var string Filename of the "scripts" data.
     */
    const FILENAME_SCRIPTS = 'scripts.json';

    /**
     * @var string "app" type of remote data.
     */
    const TYPE_APP = 'app';

    /**
     * @var string "game" type of remote data.
     */
    const TYPE_GAME = 'game';

    /**
     * @var string URL (with placeholders) to get the remote data.
     */
    const URL_REMOTE = 'https://raw.githubusercontent.com/ThePandemoniumInstitute/botc-translations/refs/heads/main/%1$s/%2$s.json';

    /**
     * @var string The official script author.
     * @todo Store this information in a better place.
     */
    const SCRIPT_AUTHOR = 'The Pandemonium Institute';

    /**
     * @var array Cache for the remote information per locale.
     */
    private array $remotes;

    public function __construct(

        #[Autowire('%kernel.project_dir%/assets/data')]
        private string $dataDirectory,

        private TPIResourcesModel $tpiResourcesModel,

    )
    {
        $this->remotes = [];
    }

    /**
     * Gets the "i18n" data.
     *
     * @param string $locale The Locale of the "i18n" data to get.
     * @return ?array Either the "i18n" data or `null` if the source couldn't be
     * access or parsed.
     */
    public function getI18n(string $locale): ?array
    {
        $source = (
            $this->dataDirectory
            . DIRECTORY_SEPARATOR
            . static::DIRECTORY_RAW
            . DIRECTORY_SEPARATOR
            . static::FILENAME_I18N
        );

        if (($json = $this->getJsonFromSource($source)) === null) {
            return null;
        }

        return array_merge($json, $this->makeI18n($locale));
    }

    /**
     * Gets the "info tokens" data.
     *
     * @param string $locale The Locale of the "info tokens" data to get.
     * @return ?array Either the "info tokens" data or `null` if the source
     * couldn't be access or parsed.
     */
    public function getInfoTokens(string $locale): ?array
    {
        $source = (
            $this->dataDirectory
            . DIRECTORY_SEPARATOR
            . static::DIRECTORY_RAW
            . DIRECTORY_SEPARATOR
            . static::FILENAME_INFO_TOKENS
        );

        if (($json = $this->getJsonFromSource($source)) === null) {
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

    /**
     * Gets the "roles" data.
     *
     * @param string $locale The Locale of the "roles" data to get.
     * @return ?array Either the "roles" data or `null` if the source couldn't
     * be access or parsed.
     */
    public function getRoles(string $locale): ?array
    {
        $source = (
            $this->dataDirectory
            . DIRECTORY_SEPARATOR
            . static::DIRECTORY_RAW
            . DIRECTORY_SEPARATOR
            . static::FILENAME_ROLES
        );

        if (($json = $this->getJsonFromSource($source)) === null) {
            return null;
        }

        // TODO: Get extra roles (e.g. Chinese Community roles)
        $converted = $this->convertReminders($json);
        $translation = $this->makeRoles($locale);

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
     * @param string $locale The Locale of the "scripts" data to get.
     * @return ?array Either the "scripts" data or `null` if the source couldn't
     * be access or parsed.
     */
    public function getScripts(string $locale): ?array
    {
        $source = (
            $this->dataDirectory
            . DIRECTORY_SEPARATOR
            . static::DIRECTORY_RAW
            . DIRECTORY_SEPARATOR
            . static::FILENAME_SCRIPTS
        );

        if (($json = $this->getJsonFromSource($source)) === null) {
            return null;
        }

        $translation = $this->makeScripts($locale);

        foreach ($json as $key => $script) {

            if (!is_string($translation[$key] ?? null)) {
                continue;
            }

            $metaIndex = array_find_key($script, function ($item) {
                return (
                    is_array($item)
                    && ($item['id'] ?? null) === RoleEnums::ID_META
                );
            });
            $metaEntry = $script[$metaIndex] ?? [];

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
     * Writes the JSON data to the destination.
     *
     * @param array $data JSON data to write.
     * @param string $locale Name of the file (without the file extension).
     * @param bool $pretty If `true`, the written file will be formatted and
     * easier to read, if `false` (default) then the file will be minified.
     * @return bool `true` if the data was sucessfully written, `false`
     * otherwise.
     */
    public function writeData(
        array $data,
        string $locale,
        bool $pretty = false,
    ): bool
    {
        $directory = (
            $this->dataDirectory
            . DIRECTORY_SEPARATOR
            . static::DIRECTORY_COMPILED
        );

        if (!is_dir($directory) && !mkdir($directory, 0744, true)) {
            return false;
        }

        $destination = (
            $directory
            . DIRECTORY_SEPARATOR
            . "{$locale}.js"
        );
        $json = json_encode($data, $pretty ? JSON_PRETTY_PRINT : 0);

        if (
            $json === false
            || file_put_contents($destination, "window.PG={$json}") === false
        ) {
            return false;
        }

        return true;
    }

    /**
     * Gets the translation information for the "i18n" data.
     *
     * @param string $locale The locale for the translation data.
     * @return array Translation data.
     */
    protected function makeI18n(string $locale): array
    {
        $app = $this->getRemote(static::TYPE_APP, $locale);
        $keys = [
            RoleEnums::TEAM_TOWNSFOLK,
            RoleEnums::TEAM_OUTSIDER,
            RoleEnums::TEAM_MINION,
            RoleEnums::TEAM_DEMON,
            RoleEnums::TEAM_TRAVELLER,
            RoleEnums::TEAM_FABLED,
            RoleEnums::TEAM_LORIC,
        ];
        $i18n = [];

        foreach ($keys as $key) {
            if ($value = $this->getPlural($app['grimoire'] ?? null, $key)) {
                $i18n[$key] = $value;
            }
        }

        return $i18n;
    }

    /**
     * Gets the translation information for the "info tokens" data.
     *
     * @param string $locale The locale for the translation data.
     * @return array Translation data.
     */
    protected function makeInfoTokens(string $locale): array
    {
        $app = $this->getRemote(static::TYPE_APP, $locale);
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
                ($value = $app['modals']['signal']['cards'][$key] ?? null)
                && is_string($value)
            ) {
                $infoTokens[$destination] = $value;
            }
        }

        return $infoTokens;
    }

    /**
     * Gets the translation information for the "roles" data.
     *
     * @param string $locale The locale for the translation data.
     * @return array Translation data.
     */
    protected function makeRoles(string $locale): array
    {
        $game = $this->getRemote(static::TYPE_GAME, $locale);
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
     * @param string $locale The locale for the translation data.
     * @return array Translation data.
     */
    protected function makeScripts(string $locale): ?array
    {
        $game = $this->getRemote(static::TYPE_GAME, $locale);
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
     * @return array Roles with converted reminders.
     */
    protected function convertReminders(array $roles): array
    {
        $reminders = $this->getReminders();

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
     * @return array Reminder conversions.
     */
    protected function getReminders()
    {
        $game = $this->getRemote(static::TYPE_GAME, 'en');

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

    /**
     * Gets the remote information from the cache, fetching it if necessary.
     *
     * @param string $type Type of remote data to get.
     * @param string $locale Locale of the remote to get.
     * @return ?array Data from the remote or `null` if anything went wrong.
     */
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

    /**
     * Fetches both the "app" and "game" remote data for the given remote.
     *
     * @param string $locale Locale whose remote data should be fetched.
     * @return ?arrray Fetched data or `null` if anything went wrong.
     */
    protected function fetchRemotes(string $locale): ?array
    {
        if (($app = $this->fetchRemote(static::TYPE_APP, $locale)) === null) {
            return null;
        }

        if (($game = $this->fetchRemote(static::TYPE_GAME, $locale)) === null) {
            return null;
        }

        return [
            static::TYPE_APP => $app,
            static::TYPE_GAME => $game,
        ];
    }

    /**
     * Fetches either the "app" or "game" data from the remote for the given
     * locale.
     *
     * @param string $type Type of remote data to fetch.
     * @param string $locale Locale of the data to fetch.
     * @return ?array The fetched data or `null` if anything went wrong.
     */
    protected function fetchRemote(string $type, string $locale): ?array
    {
        $url = sprintf(static::URL_REMOTE, $type, $locale);

        if (
            (($contents = file_get_contents($url)) === false)
            || !json_validate($contents)
        ) {
            return null;
        }

        return json_decode($contents, true);
    }
}

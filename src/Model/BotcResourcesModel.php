<?php

namespace App\Model;

use Symfony\Component\DependencyInjection\Attribute\Autowire;

class BotcResourcesModel
{
    /**
     * @var string Location of the roles data.
     */
    const ROLES_URL = 'https://release.botc.app/resources/data/roles.json';

    /**
     * @var string Location of the jinxes data.
     */
    const JINXES_URL = 'https://release.botc.app/resources/data/jinxes.json';

    /**
     * @var string Location of the nightsheet data.
     */
    const NIGHTSHEET_URL = 'https://release.botc.app/resources/data/nightsheet.json';

    /**
     * @var string File name of the special roles.
     */
    const SPECIAL_ROLES = 'special-roles.json';

    /**
     * @var string File name where the data will be saved.
     */
    const DESTINATION = 'fetched-roles.json';

    /**
     * An error message generated when validating a role.
     */
    private string $message = '';

    public function __construct(

        #[Autowire('%kernel.project_dir%/assets/data/raw/')]
        private string $dataDirectory,

        // #[Autowire('%kernel.project_dir%/assets/data/raw/special-roles.json')]
        // private string $specialRolesJson,

        // #[Autowire('%kernel.project_dir%/assets/data/raw/fetched-roles.json')]
        // private string $destinationJson,

    )
    {}

    /**
     * Gets the latest role validation error message.
     *
     * @return string Latest role validation error message.
     */
    public function getMessage() {
        return $this->message;
    }

    /**
     * Gets the special roles from the JSON file.
     *
     * @return array Success status and the body of the results.
     */
    public function getSpecialRoles()
    {
        $specialRolesJson = $this->dataDirectory . static::SPECIAL_ROLES;

        if (!file_exists($specialRolesJson)) {
            return ['success' => false, 'body' => "'{$specialRolesJson}' not found"];
        }

        $contents = file_get_contents($specialRolesJson);

        if ($contents === false) {
            return ['success' => false, 'body' => 'Failed to get special roles contents'];
        }

        if (!json_validate($contents)) {
            return ['success' => false, 'body' => 'Invalid JSON'];
        }

        return ['success' => true, 'body' => json_decode($contents, true)];
    }

    /**
     * Gets the JSON from the given URL.
     *
     * @param string $url URL to find the JSON.
     * @return array The success status body of the results.
     */
    public function getJson(string $url): array
    {
        $contents = file_get_contents($url);

        if ($contents === false) {
            return ['success' => false, 'body' => "'{$url}' not found"];
        }

        if (!json_validate($contents)) {
            return ['success' => false, 'body' => "'{$url}' not valid JSON"];
        }

        return ['success' => true, 'body' => json_decode($contents, true)];
    }

    /**
     * Checks to see if the given JSON is a valid collection of special roles.
     *
     * @param mixed $json JSON to check.
     * @return bool `true` if the JSON is a valid collection of special roles,
     * `false` otherwise.
     */
    public function isValidSpecialRoles(mixed $json): bool
    {
        return (
            is_array($json)
            && $this->array_every($json, [$this, 'isValidSpecialRoleEntry'])
        );
    }

    /**
     * Checks to see if the given JSON is a valid collection of roles.
     *
     * @param mixed $json JSON to check.
     * @return bool `true` if all entries are valid roles, `false` otherwise.
     */
    public function isValidRoles(mixed $json): bool
    {
        return (
            is_array($json)
            && $this->array_every($json, [$this, 'isValidRoleEntry'])
        );
    }

    /**
     * Checks to see if the given JSON is a valid collection of jinxes.
     *
     * @param mixed $json JSON to check.
     * @return bool `true` if the JSON is a valid collection of jinxes, `false`
     * otherwise.
     */
    public function isValidJinxes(mixed $json): bool
    {
        return (
            is_array($json)
            && $this->array_every($json, [$this, 'isValidJinxEntry'])
        );
    }

    /**
     * Checks to see if the given JSON is a valid nightsheet.
     *
     * @param mixed $json JSON to check.
     * @return bool `true` if the JSON is a valid nightsheet, `false` otherwise.
     */
    public function isValidNightsheet(mixed $json): bool
    {
        return (
            is_array($json)
            && $this->isValidNightsheetEntry($json, 'firstNight')
            && $this->isValidNightsheetEntry($json, 'otherNight')
        );
    }

    /**
     * Combines all the given arrays into a single array.
     *
     * @param array $specials Special roles ("_meta", "dawn", "demoninfo" etc.).
     * @param array $roles Main roles.
     * @param array $jinxes Jinxes.
     * @param array $nightsheet Night order.
     * @return array Combined data.
     */
    public function combineData(
        array $specials,
        array $roles,
        array $jinxes,
        array $nightsheet,
    ): array
    {
        $combined = [];
        $idToIndex = [];
        $message = [];

        foreach ($specials as $special) {

            $cleanSpecial = [
                'id' => $special['id'],
                'name' => $special['name'],
                'edition' => $special['edition'],
                'firstNight' => $special['firstNight'],
                'otherNight' => $special['otherNight'],
            ];

            if (array_key_exists('ability', $special)) {
                $cleanSpecial['ability'] = $special['ability'];
            }

            if (array_key_exists('reminders', $special)) {
                $cleanSpecial['reminders'] = $special['reminders'];
            }

            if (array_key_exists('team', $special)) {
                $cleanSpecial['team'] = $special['team'];
            }

            if (array_key_exists('firstNightReminder', $special)) {
                $cleanSpecial['firstNightReminder'] = $special['firstNightReminder'];
            }

            if (array_key_exists('otherNightReminder', $special)) {
                $cleanSpecial['otherNightReminder'] = $special['otherNightReminder'];
            }

            $idToIndex[$special['id']] = count($combined);
            $combined[] = $cleanSpecial;

        }

        foreach ($roles as $role) {

            $cleanRole = [
                'id' => $role['id'],
                'name' => $role['name'],
                'team' => $role['team'],
                'edition' => $role['edition'],
                'setup' => $role['setup'],
                'ability' => $role['ability'],
                'flavor' => $role['team'],
            ];

            if (array_key_exists('reminders', $role)) {
                $cleanRole['reminders'] = $role['reminders'];
            }

            if (array_key_exists('remindersGlobal', $role)) {
                $cleanRole['remindersGlobal'] = $role['remindersGlobal'];
            }

            if (array_key_exists('firstNightReminder', $role)) {
                $cleanRole['firstNightReminder'] = $this->cleanNightReminder($role['firstNightReminder']);
            }

            if (array_key_exists('otherNightReminder', $role)) {
                $cleanRole['otherNightReminder'] = $this->cleanNightReminder($role['otherNightReminder']);
            }

            if (array_key_exists('special', $role)) {
                $cleanRole['special'] = $role['special'];
            }

            $idToIndex[$role['id']] = count($combined);
            $combined[] = $cleanRole;

        }

        foreach ($jinxes as $jinx) {

            $index = $idToIndex[$jinx['id']] ?? -1;

            if ($index < 0) {
                $message[] = "Unrecognised jinx target '{$jinx['id']}'";
                continue;
            }

            $combined[$index]['jinxes'] = $jinx['jinx'];

        }

        foreach ($nightsheet as $night => $ids) {

            foreach ($ids as $nightOrder => $roleId) {

                $index = $idToIndex[$jinx['id']] ?? -1;

                if ($index < 0) {
                    $message[] = "Unrecognised role '{$roleId}'";
                    continue;
                }

                $combined[$index][$night] = $nightOrder;

            }

        }

        $this->message = implode(PHP_EOL, $message);

        return $combined;
    }

    /**
     * Writes the JSON data to the destination.
     */
    public function writeData(array $data): bool
    {
        $destination = $this->dataDirectory . static::DESTINATION;

        if (file_put_contents($destination, json_encode($data)) === false) {
            return false;
        }

        return true;
    }

    /**
     * Checks to see if the given item is a valid special role.
     *
     * @param mixed $item Item to check.
     * @return bool `true` if the item is a valid special role, `false`
     * otherwise.
     */
    protected function isValidSpecialRoleEntry(mixed $item): bool
    {
        if (
            !is_array($item)
            || !is_string($item['id'] ?? null)
            || !is_string($item['name'] ?? null)
            || ($item['edition'] ?? null) !== 'special'
            || !is_int($item['firstNight'] ?? null)
            || !is_int($item['otherNight'] ?? null)
            || (array_key_exists('ability', $item) && !is_string($item['ability']))
            || (
                array_key_exists('reminders', $item)
                && (
                    !is_array($item['reminders'])
                    || !$this->array_every($item['reminders'], function ($reminder) {
                        return is_string($reminder['name'] ?? null);
                    })
                )
            )
            || (array_key_exists('team', $item) && !is_string($item['team']))
            || (array_key_exists('firstNightReminder', $item) && !is_string($item['firstNightReminder']))
            || (array_key_exists('otherNightReminder', $item) && !is_string($item['otherNightReminder']))
         ) {
            return false;
        }

        return true;
    }

    /**
     * Checks to see if the given item is a valid role.
     *
     * @param mixed $item Item to check.
     * @return bool `true` if the item is a valid role, `false` otherwise.
     */
    public function isValidRoleEntry(mixed $item): bool
    {
        $this->message = '';

        // Check that we can even debug this entry.
        if (!is_array($item) || !is_string($item['id'] ?? null)) {
            $this->message = 'Not an array or missing ID';
            return false;
        }

        // Check the basic structure and make sure that all required keys exist
        // in a format that we're expecting.
        // ("required" based on the keys that appear in all entries in roles.json)
        if (
            !is_string($item['name'] ?? null)
            || !is_string($item['team'] ?? null)
            || !is_string($item['edition'] ?? null)
            || !is_bool($item['setup'] ?? null)
            || !is_string($item['ability'] ?? null)
            || !is_string($item['flavor'] ?? null)
        ) {
            $this->message = "'{$item['id']}' missing required key";
            return false;
        }

        // If reminders exist, make sure that they're an array of strings.
        if (
            array_key_exists('reminders', $item)
            && (
                !is_array($item['reminders'])
                || !$this->array_every($item['reminders'], function ($reminder) {
                    return is_string($reminder);
                })
            )
        ) {
            $this->message = "'{$item['id']}' invalid reminders";
            return false;
        }

        // If global reminders exist, make sure that they're an array of
        // strings.
        if (
            array_key_exists('remindersGlobal', $item)
            && (
                !is_array($item['remindersGlobal'])
                || !$this->array_every($item['remindersGlobal'], function ($reminder) {
                    return is_string($reminder);
                })
            )
        ) {
            $this->message = "'{$item['id']}' invalid reminders global";
            return false;
        }

        // If a first night reminder exists, make sure it's a string.
        if (
            array_key_exists('firstNightReminder', $item)
            && !is_string($item['firstNightReminder'])
        ) {
            $this->message = "'{$item['id']}' invalid first night reminder";
            return false;
        }

        // If an other night reminder exists, make sure it's a string.
        if (
            array_key_exists('otherNightReminder', $item)
            && !is_string($item['otherNightReminder'])
        ) {
            $this->message = "'{$item['id']}' invalid other night reminder";
            return false;
        }

        // If specials exist, make sure they look valid.
        if (
            array_key_exists('special', $item)
            && (
                !is_array($item['special'])
                || !$this->array_every($item['special'], [$this, 'isValidSpecialEntry'])
            )
        ) {
            $this->message = "'{$item['id']}' invalid special";
            return false;
        }

        return true;
    }

    /**
     * Checks to see if the given item is a valid role special entry.
     *
     * @param mixed $item Item to check.
     * @return bool `true` if the item is a valid role special entry, `false`
     * otherwise.
     */
    protected function isValidSpecialEntry(mixed $item): bool
    {
        return (
            is_array($item)
            && is_string($item['type'] ?? null)
            && is_string($item['name'] ?? null)
            && (!array_key_exists('time', $item) || is_string($item['time']))
            && (!array_key_exists('global', $item) || is_string($item['global']))
            && (
                !array_key_exists('value', $item)
                || is_string($item['value'])
                || is_int($item['value'])
            )
        );
    }

    /**
     * Checks to see if the given item is a valid jinx entry.
     *
     * @param mixed $item Item to check.
     * @return bool `true` if the item is a valid jinx entry, `false` otherwise.
     */
    protected function isValidJinxEntry(mixed $item): bool
    {
        return (
            is_array($item)
            && is_string($item['id'] ?? null)
            && is_array($item['jinx'] ?? null)
            && $this->array_every($item['jinx'], [$this, 'isValidJinxJinxEntry'])
        );
    }

    /**
     * Checks to see if the given item is a valid "jinx" item in a jinx entry.
     *
     * @param mixed $item Item to check.
     * @return bool `true` if the item is a valid "jinx" item in a jinx entry,
     * `false` otherwise.
     */
    protected function isValidJinxJinxEntry(mixed $item): bool
    {
        return (
            is_array($item)
            && is_string($item['id'] ?? null)
            && is_string($item['reason'] ?? null)
        );
    }

    /**
     * Checks to see if the given array and related key are a valid nightsheet
     * entry.
     *
     * @param array $array Night sheet.
     * @param string $key Key for the night sheet.
     * @return bool `true` if the data in the given array at the given key is a
     * valid night sheet entry, `false` otherwise.
     */
    protected function isValidNightsheetEntry(array $array, string $key): bool
    {
        return (
            array_key_exists($key, $array)
            && is_array($array[$key])
            && $this->array_every($array[$key], function ($item) {
                return is_string($item);
            })
        );
    }

    /**
     * Cleans the given text to remove any instance of ":reminder:" (and any
     * extra spaces generated by that removal).
     *
     * @param string $nightReminder Night reminder to clean.
     * @return string Cleaned night reminder.
     */
    protected function cleanNightReminder(string $nightReminder)
    {
        $removed = str_replace(':reminder:', '', $nightReminder);
        $unspaced = preg_replace('/\s+/', ' ', $removed);
        
        // Fix the Po.
        $unorred = preg_replace('/\.\s+or\s+$/', '', $unspaced);
        $despaced = preg_replace('/\s+/', ' ', $unorred);

        return $despaced;
    }

    /**
     * Runs the given predicate function on every item in the array, returning
     * `true` if every item passes and `false` if any fail.
     * Be aware that this function will return `true` if given an empty array.
     *
     * @param array $array Array whose items should be checked.
     * @param callable $predicate Function to check every array item.
     * @return bool `true` if every item passes, `false` otherwise.
     */
    protected function array_every(array $array, callable $predicate): bool
    {
        foreach ($array as $item) {
            if (!$predicate($item)) {
                return false;
            }
        }
        return true;
    }
}

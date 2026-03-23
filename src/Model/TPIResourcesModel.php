<?php

namespace App\Model;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use App\Enums\{
    ReminderFlagEnums,
    RoleSpecialNameEnums,
    RoleSpecialTypeEnums,
};

class TPIResourcesModel
{
    /**
     * @var string File name of the special roles.
     */
    const FILENAME_SPECIAL_ROLES = 'special-roles.json';

    /**
     * @var string File name of the images file.
     */
    const FILENAME_IMAGES = 'images.json';

    /**
     * @var string File name where the data will be saved.
     */
    const FILENAME_DESTINATION = 'fetched-roles.json';

    /**
     * @var string Location of the roles data.
     */
    const URL_ROLES = 'https://release.botc.app/resources/data/roles.json';

    /**
     * @var string Location of the jinxes data.
     */
    const URL_JINXES = 'https://release.botc.app/resources/data/jinxes.json';

    /**
     * @var string Location of the nightsheet data.
     */
    const URL_NIGHTSHEET = 'https://release.botc.app/resources/data/nightsheet.json';

    /**
     * An error message generated when validating a role.
     */
    private string $message = '';

    public function __construct(

        #[Autowire('%kernel.project_dir%/assets/data/raw')]
        private string $dataDirectory,

    )
    {}

    /**
     * Gets the latest role validation error message.
     *
     * @return string Latest role validation error message.
     */
    public function getMessage()
    {
        return $this->message;
    }

    /**
     * Gets the special roles from the JSON file.
     *
     * @return array Success status and the body of the results.
     */
    public function getLocale(string $filename): array
    {
        $file = $this->dataDirectory . DIRECTORY_SEPARATOR . $filename;

        if (!file_exists($file)) {
            return ['success' => false, 'body' => "'{$file}' not found"];
        }

        return $this->getContentsAsJson($file);
    }

    /**
     * Gets the JSON from the given URL.
     *
     * @param string $url URL to find the JSON.
     * @return array The success status body of the results.
     */
    public function getRemote(string $url): array
    {
        return $this->getContentsAsJson($url);
    }

    /**
     * Filter the special roles so that only valid roles are included.
     *
     * @param array $specials Special roles to filter.
     * @return array Filtered special roles.
     */
    public function filterSpecials(array $specials): array
    {
        $filtered = array_filter($specials, [$this, 'isValidSpecialRoleEntry']);

        foreach ($filtered as $special) {

            if (is_array($special['reminders'] ?? null)) {
                $special['reminders'] = array_filter($special['reminders'], function ($item) {
                    return is_array($item) && is_string($item['name'] ?? null);
                });
            }

        }

        return $filtered;
    }

    /**
     * Filter the images so that only valid image entries are included.
     *
     * @param array $images Images to filter.
     * @return array Filtered images.
     */
    public function filterImages(array $images): array
    {
        return array_filter($images, [$this, 'isValidImagesEntry']);
    }

    /**
     * Filter the roles so that only valid roles are included.
     *
     * @param array $specials Roles to filter.
     * @return array Filtered roles.
     */
    public function filterRoles(array $roles): array
    {
        $filtered = array_filter($roles, [$this, 'isValidRoleEntry']);

        foreach ($filtered as $role) {

            if (is_array($role['reminders'] ?? null)) {
                $role['reminders'] = array_filter($role['reminders'], function ($item) {
                    return is_string($item);
                });

                if (!count($role['reminders'])) {
                    unset($role['reminders']);
                }
            }

            if (is_array($role['remindersGlobal'] ?? null)) {
                $role['remindersGlobal'] = array_filter($role['remindersGlobal'], function ($item) {
                    return is_string($item);
                });

                if (!count($role['remindersGlobal'])) {
                    unset($role['remindersGlobal']);
                }
            }

            if (is_array($role['special'] ?? null)) {
                $role['special'] = array_filter($role['special'], function ($item) {
                    return $this->isValidSpecialEntry($item);
                });

                if (!count($role['special'])) {
                    unset($role['special']);
                }
            }

        }

        return $filtered;
    }

    /**
     * Filter the jinxes so that only valid jinxes are included.
     *
     * @param array $specials Jinxes to filter.
     * @return array Filtered jinxes.
     */
    public function filterJinxes(array $jinxes): array
    {
        $filtered = array_filter($jinxes, [$this, 'isValidJinxEntry']);

        foreach ($filtered as $index => $jinx) {
            $jinx['jinx'] = array_filter($jinx['jinx'], function ($item) {
                return $this->isValidJinxJinxEntry($item);
            });

            if (!count($jinx['jinx'])) {
                array_splice($filtered, $index, 1);
            }
        }

        return $filtered;
    }

    /**
     * Filter the night sheet so that only valid entries are included.
     *
     * @param array $specials Night sheet to filter.
     * @return array Filtered sheet.
     */
    public function filterNightsheet(array $nightsheet): array
    {
        $filtered = array_filter($nightsheet, function ($item) {
            return is_array($item);
        });

        foreach ($filtered as $key => $night) {
            $filtered[$key] = array_filter($night, function ($id) {
                return is_string($id);
            });
        }

        return $filtered;
    }

    /**
     * Combines all the given arrays into a single array.
     *
     * @param array $specials Special roles ("_meta", "dawn", "demoninfo" etc.).
     * @param array $roles Main roles.
     * @param array $jinxes Jinxes.
     * @param array $nightsheet Night order.
     * @param array $images Image data.
     * @return array Combined data.
     */
    public function combineData(
        array $specials,
        array $roles,
        array $jinxes,
        array $nightsheet,
        array $images,
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

        $fixedReminders = $this->convertReminders($combined);
        $withImages = $this->applyImages($fixedReminders, $images);

        $this->message = implode(PHP_EOL, $message);

        usort($withImages, function ($a, $b) {
            return $a['id'] <=> $b['id'];
        });

        return $withImages;
    }

    /**
     * Writes the JSON data to the destination.
     *
     * @param array $data JSON data to write.
     * @param bool $pretty If `true`, the written file will be formatted and
     * easier to read, if `false` (default) then the file will be minified.
     * @return bool `true` if the data was sucessfully written, `false`
     * otherwise.
     */
    public function writeData(array $data, bool $pretty = false): bool
    {
        $destination = (
            $this->dataDirectory
            . DIRECTORY_SEPARATOR
            . static::FILENAME_DESTINATION
        );
        $json = json_encode($data, $pretty ? JSON_PRETTY_PRINT : 0);

        if ($json === false || file_put_contents($destination, $json) === false) {
            return false;
        }

        return true;
    }

    /**
     * Gets the data from the saved file, returning `null` if the data couldn't
     * be retrieved or parsed.
     *
     * @return ?array Parsed data or `null` if the data can't be read or parsed.
     */
    public function getData(): ?array
    {
        $destination = (
            $this->dataDirectory
            . DIRECTORY_SEPARATOR
            . static::FILENAME_DESTINATION
        );

        if (
            !file_exists($destination)
            || (($contents = file_get_contents($destination)) === false)
            || (($data = json_decode($contents, true)) === null)
            || !is_array($data)
        ) {
            return null;
        }

        return $data;
    }

    /**
     * Cleans the given text to remove any instance of ":reminder:" (and any
     * extra spaces generated by that removal).
     *
     * @param string $nightReminder Night reminder to clean.
     * @return string Cleaned night reminder.
     */
    public function cleanNightReminder(string $nightReminder)
    {
        $removed = str_replace(':reminder:', '', $nightReminder);
        $unspaced = preg_replace('/\s+/', ' ', $removed);
        
        // Fix the Po.
        $unorred = preg_replace('/\.\s+[a-z]\s+$/i', '', $unspaced);
        $despaced = preg_replace('/\s+/', ' ', $unorred);

        return $despaced;
    }

    /**
     * Gets the contents of the given source and attempts to parse it as JSON,
     * returning an array with a "success" key and a "body" key.
     *
     * @param string $source Source of the contents to get and parse.
     * @return array Results of parsing the contents (if possible).
     */
    protected function getContentsAsJson(string $source): array
    {
        $contents = file_get_contents($source);

        if ($contents === false) {
            return ['success' => false, 'body' => "'{$source}' not found"];
        }

        if (!json_validate($contents)) {
            return ['success' => false, 'body' => "'{$source}' not valid JSON"];
        }

        $decoded = json_decode($contents, true);

        if (!is_array($decoded)) {
            return ['success' => false, 'body' => 'JSON not an array'];
        }

        return ['success' => true, 'body' => $decoded];
    }

    /**
     * Applies the images to the given roles.
     *
     * @param array $roles Roles that should gain images.
     * @param array $images Images to apply to the roles.
     * @return array Roles with images applied.
     */
    protected function applyImages(array $roles, array $images): array
    {
        return array_map(function ($role) use ($images) {

            if (!array_key_exists($role['id'], $images)) {
                return $role;
            }

            $image = $images[$role['id']];

            $role['image'] = $image['image'] ?? $image;

            foreach (($image['reminders'] ?? []) as $index => $reminderImage) {
                if (
                    is_array($role['reminders'] ?? null)
                    && $index <  count($role['reminders'])
                ) {
                    $role['reminders'][$index]['image'] = $reminderImage;
                }
            }

            return $role;

        }, $roles);
    }

    /**
     * Converts all the reminders in the given roles.
     *
     * @param array $roles Roles whose reminders should be converted.
     * @return array Roles with converted reminders.
     */
    protected function convertReminders(array $roles): array
    {
        return array_map(function ($role) {

            $reminders = $this->convertRoleReminders(
                $role['reminders'] ?? [],
                $role['remindersGlobal'] ?? [],
                $role['special'] ?? [],
            );
            unset($role['reminders'], $role['remindersGlobal']);

            if (count($reminders)) {
                $role['reminders'] = $reminders;
            }

            return $role;

        }, $roles);
    }

    /**
     * Converts the given reminders into the modern format.
     *
     * @param array $reminders Local reminder to convert.
     * @param array $remindersGlobal Global reminder to convert.
     * @param array $special Special information about the role.
     * @return array Converted reminders.
     */
    protected function convertRoleReminders(
        array $reminders,
        array $remindersGlobal,
        array $special,
    ): array
    {
        $convertedReminders = [];

        foreach ($reminders as $reminder) {

            $converted = [];

            if (is_string($reminder)) {
                $converted['name'] = $reminder;
            } elseif (is_array($reminder)) {

                if (is_string($reminder['name'] ?? null)) {
                    $converted['name'] = $reminder['name'];
                }

                if (
                    is_array($reminder['flags'] ?? null)
                    && array_all($reminder['flags'], function ($item) {
                        return is_string($item);
                    })
                ) {
                    $converted['flags'] = $reminder['flags'];
                }

                if (is_int($reminder['count'] ?? null)) {
                    $converted['count'] = $reminder['count'];
                }

                if (is_string($reminder['image'] ?? null)) {
                    $converted['image'] = $reminder['image'];
                }

            }

            if (!is_string($converted['name'] ?? null)) {
                continue;
            }

            foreach ($convertedReminders as $reminder) {
                if ($reminder['name'] === $converted['name']) {
                    $reminder['count'] = ($reminder['count'] ?? 1) + 1;
                    continue 2;
                }
            }

            $convertedReminders[] = $converted;

        }

        foreach ($remindersGlobal as $index => $reminder) {

            $flags = [ReminderFlagEnums::GLOBAL->value];
            $replace = array_find($special, function ($special) {
                return (
                    ($special['type'] ?? '') === RoleSpecialTypeEnums::REVEAL->value
                    && ($special['name'] ?? '') === RoleSpecialNameEnums::REPLACE_CHARACTER->value
                );
            });

            if (!is_null($replace) && $index === 0) {
                $flags[] = ReminderFlagEnums::ROLE->value;
            }

            $convertedReminders[] = [
                'name' => $reminder,
                'flags' => $flags,
            ];

        }

        return $convertedReminders;
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
            || (array_key_exists('team', $item) && !is_string($item['team']))
            || (array_key_exists('firstNightReminder', $item) && !is_string($item['firstNightReminder']))
            || (array_key_exists('otherNightReminder', $item) && !is_string($item['otherNightReminder']))
         ) {
            return false;
        }

        return true;
    }

    /**
     * Checks to see if the given item is a valid image entry.
     *
     * @param mixed $item Item to check.
     * @return bool `true` if the item is a valid image entry, `false`
     * otherwise.
     */
    public function isValidImagesEntry(mixed $item): bool
    {
        if (!is_string($item) && !is_array($item)) {
            return false;
        }

        if (is_array($item)) {

            if (array_all($item, function ($url) {
                return is_string($url);
            })) {
                return (count($item) > 0 && count($item) <= 3);
            }

            if (
                array_key_exists('image', $item)
                && !$this->isValidImagesEntry($item['image'])
            ) {
                return false;
            }

            if (
                array_key_exists('reminders', $item)
                && !$this->isValidImagesEntry($item['reminders'])
            ) {
                // NOTE: this might be a future bug since we haven't fully
                // figured out the "reminders" key here.
                return false;
            }

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
        );
    }
}

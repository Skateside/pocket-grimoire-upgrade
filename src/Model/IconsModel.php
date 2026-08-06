<?php

namespace App\Model;

use App\Enums\RoleTeamEnums;
use App\Service\Storage;

class IconsModel
{
    /**
     * @var string Colour representing the good team in the SVG files.
     */
    const COLOUR_GOOD = '#0000FF';

    /**
     * @var string Colour representing the evil team in the SVG files.
     */
    const COLOUR_EVIL = '#FF0000';

    /**
     * @var string URL of the zip file containing the raw SVG files.
     */
    const URL_ZIP = 'https://github.com/tomozbot/botc-icons/archive/refs/heads/main.zip';

    /**
     * @var string LOCATION_SPECIAL_ICONS Key for the location of the special icons.
     */
    const LOCATION_SPECIAL_ICONS = 'special-role-icons';

    /**
     * @var string LOCATION_DESTINATIONS Key for the destination of the icons.
     */
    const LOCATION_DESTINATION = 'role-icons-destination';

    /**
     * @var string LOCATION_ALTERNATIVE Key for the destination of the icon alternatives.
     */
    const LOCATION_ALTERNATIVE = 'role-icons-alternative';

    public function __construct(
        protected Storage $storage,
    )
    {}

    /**
     * Copies the SVG files for the "special" roles (meta, dawn, demon info
     * etc.) into the destination directory.
     *
     * @return bool `true` on success, `false` if anything failed.
     */
    public function copyIcons(): bool
    {
        if (!$this->storage->mkdir(static::LOCATION_DESTINATION, 0744)) {
            return false;
        }

        $icons = $this->storage->getFilenames(
            static::LOCATION_SPECIAL_ICONS,
            function (string $file) {
                return str_ends_with($file, '.svg');
            },
        );

        if ($icons === false) {
            return false;
        }

        foreach ($icons as $icon) {
            if (!$this->storage->copyFile(
                $this->storage->getFilename(static::LOCATION_SPECIAL_ICONS, $icon),
                $this->storage->getFilename(static::LOCATION_DESTINATION, $icon),
            )) {
                return false;
            }
        }

        return true;
    }

    /**
     * Fetches the SVGs from the remote zip file and processes them. An array
     * with a `success` boolean and `body` property is returned which describes
     * the success or any failure.
     *
     * @param array{id: string, team: string}[] $roles Roles that should gain icons.
     * @return array{success: bool, body: string|int} Array with success/failure information.
     */
    public function fetchSVGs(array $roles): array
    {
        $files = [];
        $result = $this->storage->processZip(
            static::URL_ZIP,
            function (\SplFileInfo $file) use (&$files) {
                $filename = $file->getFilename();

                if (str_ends_with($filename, '.svg')) {
                    $files[$filename] = file_get_contents($file->getRealPath());
                }
            },
        );

        if (!$result) {
            return ['success' => false, 'body' => 'Zip processing failed'];
        }

        $successful = 0;

        foreach ($roles as $role) {
            $key = "{$role['id']}.svg";

            if (!array_key_exists($key, $files)) {
                continue;
            }

            $icons = $this->writeIcons($role['id'], $files[$key], $role['team']);

            foreach ($icons['base'] as $name => $contents) {
                $this->storage->write(static::LOCATION_DESTINATION, $name, $contents);
            }

            foreach ($icons['alt'] as $name => $contents) {
                $this->storage->write(static::LOCATION_ALTERNATIVE, $name, $contents);
            }

            $successful += 1;
        }

        return ['success' => true, 'body' => $successful];
    }

    /**
     * Writes the icon and and alternatives into the destination directory.
     *
     * @param string $roleId ID of the role whose icons should be written.
     * @param string $svg Contents of the default SVG icon for the role.
     * @param string $roleTeam Team that the role belongs to (Townsfolk, Demon
     * etc.) - used to work out which alternatives should be created (if any).
     * @return array{base: array<string, string>, alt: array<string, string>}
     * The contents of the SVG files for the base icon and alternative(s).
     */
    protected function writeIcons(
        string $roleId,
        string $svg,
        string $roleTeam,
    ): array
    {
        $icons = [
            'base' => [
                "{$roleId}.svg" => $svg,
            ],
            'alt' => [],
        ];

        switch ($roleTeam) {
            case RoleTeamEnums::TOWNSFOLK->value:
            case RoleTeamEnums::OUTSIDER->value:
                $icons['alt']["{$roleId}.svg"] = $this->convertSVGToEvil($svg);
                break;

            case RoleTeamEnums::MINION->value:
            case RoleTeamEnums::DEMON->value:
                $icons['alt']["{$roleId}.svg"] = $this->convertSVGToGood($svg);
                break;

            case RoleTeamEnums::TRAVELLER->value:
                $icons['alt']["{$roleId}_g.svg"] = $this->convertSVGToGood($svg);
                $icons['alt']["{$roleId}_e.svg"] = $this->convertSVGToEvil($svg);
                break;
        }

        return $icons;
    }

    /**
     * Converts a good SVG icon into an evil one.
     *
     * @param string $svg SVG string to convert.
     * @return string Converted SVG.
     */
    protected function convertSVGToGood(string $svg): string
    {
        return str_ireplace(static::COLOUR_EVIL, static::COLOUR_GOOD, $svg);
    }

    /**
     * Converts an evil SVG icon into a good one.
     *
     * @param string $svg SVG string to convert.
     * @return string Converted SVG.
     */
    protected function convertSVGToEvil(string $svg): string
    {
        return str_ireplace(static::COLOUR_GOOD, static::COLOUR_EVIL, $svg);
    }
}

<?php

namespace App\Model;

use App\Enums\RoleTeamEnums;

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
     * Writes the icon and and alternatives into the destination directory.
     *
     * @param string $roleId ID of the role whose icons should be written.
     * @param string $svg Contents of the default SVG icon for the role.
     * @param string $roleTeam Team that the role belongs to (Townsfolk, Demon
     * etc.) - used to work out which alternatives should be created (if any).
     * @return array{base: array<string, string>, alt: array<string, string>}
     * The contents of the SVG files for the base icon and alternative(s).
     */
    public function writeIcons(
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

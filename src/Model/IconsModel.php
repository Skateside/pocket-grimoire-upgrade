<?php

namespace App\Model;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
// use App\Model\TPIResourcesModel;
use App\Enums\{
    // RoleIdEnums,
    RoleTeamEnums,
};

class IconsModel
{
    const URL_REMOTE = 'https://raw.githubusercontent.com/tomozbot/botc-icons/refs/heads/main/SVG/%s.svg';

    const DIRECTORY_DESTINATION = 'roles';
    const DIRECTORY_ALTERNATIVE = 'alternative';

    const COLOUR_GOOD = '#0000FF';
    const COLOUR_EVIL = '#FF0000';

    public function __construct(

        #[Autowire('%kernel.project_dir%/public')]
        private string $publicDirectory,

        #[Autowire('%kernel.project_dir%/assets/images/roles')]
        private string $assetsDirectory,

    )
    {}

    public function fetchIcon(string $roleId): string | false
    {
        $url = sprintf(static::URL_REMOTE, $roleId);
        $curl = curl_init();
        $headers = [];
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HEADER, true);
        curl_setopt($curl, CURLOPT_HEADERFUNCTION, function ($curl, $header) use (&$headers) {
            $length = strlen($header);
            $headerParts = explode(':', $header);
            if (count($headerParts) < 2) {
                return $length;
            }
            $headers[strtolower(trim($headerParts[0]))] = trim($headerParts[1]);
            return $length;
        });
        $response = curl_exec($curl);

        if (($headers['content-type'] ?? '') !== 'image/svg+xml') {
            return false;
        }

        $headerSize = curl_getinfo($curl, CURLINFO_HEADER_SIZE);
        $body = trim(substr($response, $headerSize));

        if (empty($body)) {
            return false;
        }

        return $body;
    }

    public function writeIcons(string $roleId, string $svg, string $type): bool
    {
        $directories = $this->getDirectories();

        if (!$this->writeDirectories($directories)) {
            return false;
        }

        if (!$this->writeFile(
            $directories->destination,
            "{$roleId}.svg",
            $svg,
        )) {
            return false;
        }

        switch ($type) {
            case RoleTeamEnums::TOWNSFOLK->value:
            case RoleTeamEnums::OUTSIDER->value:

                if (!$this->writeFile(
                    $directories->alternative,
                    "{$roleId}.svg",
                    $this->convertSVGToEvil($svg),
                )) {
                    return false;
                }

                break;

            case RoleTeamEnums::MINION->value:
            case RoleTeamEnums::DEMON->value:

                if (!$this->writeFile(
                    $directories->alternative,
                    "{$roleId}.svg",
                    $this->convertSVGToGood($svg),
                )) {
                    return false;
                }

                break;

            case RoleTeamEnums::TRAVELLER->value:

                if (!$this->writeFile(
                    $directories->alternative,
                    "{$roleId}_g.svg",
                    $this->convertSVGToGood($svg),
                )) {
                    return false;
                }

                if (!$this->writeFile(
                    $directories->alternative,
                    "{$roleId}_e.svg",
                    $this->convertSVGToEvil($svg),
                )) {
                    return false;
                }

                break;
        }

        return true;
    }

    public function copyIcons(): bool
    {
        $files = scandir($this->assetsDirectory);
        
        if ($files === false) {
            return false;
        }

        $directories = $this->getDirectories();

        if (!$this->writeDirectory($directories->destination)) {
            return false;
        }

        $icons = array_filter($files, function ($file) {
            return str_ends_with($file, '.svg');
        });

        foreach ($icons as $icon) {
            if (!copy(
                $this->assetsDirectory . DIRECTORY_SEPARATOR . $icon,
                $directories->destination . DIRECTORY_SEPARATOR . $icon,
            )) {
                return false;
            }
        }

        return true;
    }

    private function getDirectories(): object
    {
        $destinationDirectory = (
            $this->publicDirectory
            . DIRECTORY_SEPARATOR
            . static::DIRECTORY_DESTINATION
        );
        $alternativeDirectory = (
            $destinationDirectory
            . DIRECTORY_SEPARATOR
            . static::DIRECTORY_ALTERNATIVE
        );

        return (object) [
            'destination' => $destinationDirectory,
            'alternative' => $alternativeDirectory,
        ];
    }

    private function writeDirectories(object $directories): bool
    {
        if (
            !$this->writeDirectory($directories->destination)
            || !$this->writeDirectory($directories->alternative)
        ) {
            return false;
        }

        return true;
    }

    private function writeDirectory($directory): bool
    {
        if ((!is_dir($directory) && !mkdir($directory, 0744, true))) {
            return false;
        }

        return true;
    }

    private function writeFile($directory, $filename, $contents): bool
    {
        if (file_put_contents(
            $directory . DIRECTORY_SEPARATOR . $filename,
            $contents,
        ) === false) {
            return false;
        }

        return true;
    }

    private function convertSVGToGood(string $svg): string
    {
        return str_ireplace(static::COLOUR_EVIL, static::COLOUR_GOOD, $svg);
    }

    private function convertSVGToEvil(string $svg): string
    {
        return str_ireplace(static::COLOUR_GOOD, static::COLOUR_EVIL, $svg);
    }
}

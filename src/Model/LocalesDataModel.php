<?php

namespace App\Model;

use Symfony\Component\DependencyInjection\Attribute\Autowire;

/** @deprecated */
class LocalesDataModel
{
    const JINXES = 'jinxes.json';
    const ROLES = 'roles.json';

    public function __construct(

        #[Autowire('%kernel.project_dir%/assets/data/localised/')]
        private string $localesDirectory,

    )
    {}

    public function extractRolesText(array $data): array
    {
        $roles = array_map(function ($entry) {

            $extracted = [];

            if (is_string($entry['id'] ?? null)) {
                $extracted['id'] = $entry['id'];
            } else {
                return null;
            }

            if (is_string($entry['name'] ?? null)) {
                $extracted['name'] = $entry['name'];
            } else {
                return null;
            }

            if (is_string($entry['ability'] ?? null)) {
                $extracted['ability'] = $entry['ability'];
            }

            if (is_string($entry['firstNightReminder'] ?? null)) {
                $extracted['firstNightReminder'] = $entry['firstNightReminder'];
            }

            if (is_string($entry['otherNightReminder'] ?? null)) {
                $extracted['otherNightReminder'] = $entry['otherNightReminder'];
            }

            if (
                is_array($entry['reminders'] ?? null)
                && array_all($entry['reminders'], function ($value) {
                    return is_string($value);
                })
                && count($entry['reminders'])
            ) {
                $extracted['reminders'] = $entry['reminders'];
            }

            if (
                is_array($entry['remindersGlobal'] ?? null)
                && array_all($entry['remindersGlobal'], function ($value) {
                    return is_string($value);
                })
                && count($entry['remindersGlobal'])
            ) {
                $extracted['remindersGlobal'] = $entry['remindersGlobal'];
            }

            return $extracted;

        }, $data);

        return array_filter($roles, function ($role) {
            return !is_null($role);
        });
    }

    public function extractJinxes(array $data): array
    {
        $jinxes = [];

        $jinxRoles = array_filter($data, function ($entry) {
            return is_array($entry['jinxes'] ?? null);
        });

        foreach ($jinxRoles as $role) {

            $target = $role['id'] ?? null;

            if (!is_string($target)) {
                continue;
            }

            foreach ($role['jinxes'] as $jinx) {

                $trick = $jinx['id'] ?? null;
                $reason = $jinx['reason'] ?? null;

                if (!is_string($trick) || !is_string($reason)) {
                    continue;
                }

                $jinxes[] = [
                    'target' => $target,
                    'trick' => $trick,
                    'reason' => $reason,
                ];

            }

        }

        return $jinxes;
    }

    public function writeFile(string $locale, string $filename, array $data): bool
    {
        $directory = "{$this->localesDirectory}{$locale}"; 

        if (!$this->makeDirectory($directory)) {
            return false;
        }

        $filename = "{$directory}/{$filename}";
        $json = json_encode($data, JSON_PRETTY_PRINT);

        if ($json === false || file_put_contents($filename, $json) === false) {
            return false;
        }

        return true;
    }

    protected function makeDirectory(string $directory): bool
    {
        if (is_dir($directory)) {
            return true;
        }

        return mkdir($directory, 0744, true);
    }
}

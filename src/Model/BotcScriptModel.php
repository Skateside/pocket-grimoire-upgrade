<?php

namespace App\Model;

use Symfony\Component\DependencyInjection\Attribute\Autowire;

class BotcScriptModel
{
    private $roles;

    public function __construct(
        #[Autowire('%kernel.project_dir%/assets/data/raw/roles.json')]
        string $rolesFile,
    ) {
        if (!file_exists($rolesFile)) {
            throw new \Exception("No file found at '{$rolesFile}'");
        }

        $this->roles = json_decode(file_get_contents($rolesFile), true);
    }

    public function convert(array $json)
    {
        $response = [
            'success' => true,
            'body' => [],
        ];

        if (!array_key_exists('results', $json) || count($json['results']) === 0) {

            return [
                'success' => false,
                'body' => 'error.no_results',
            ];

        }

        $results = $json['results'];
        usort($results, function ($a, $b) {
            return $a['name'] <=> $b['name'];
        });

        foreach ($results as $result) {

            $response['body'][] = [
                'id' => $result['script_id'],
                'author' => $result['author'],
                'name' => $result['name'],
                'script' => $result['content'],
                'version' => $result['version'],
                // BotC Scripts doesn't seem to provide this info, but we need it.
                'type' => $this->guessScriptType($result['content']),
            ];

        }

        return $response;
    }

    public function guessScriptType(array $script)
    {
        $excludeTeams = [
            'traveler',
            'traveller',
            'fabled',
            'loric',
        ];
        $roles = array_filter($script, function ($item) use ($excludeTeams) {

            // Filter out anything called "_meta".
            if ($item === '_meta') {
                return false;
            }

            if (is_array($item)) {

                // Filter out the meta entry.
                if (array_key_exists('id', $item) && $item['id'] === '_meta') {
                    return false;
                }

                // Filter out homebrew travellers, fabled, and lorics.
                if (
                    array_key_exists('team', $item)
                    && in_array($item['team'], $excludeTeams)
                ) {
                    return false;
                }
                
            }
            
            // Filter out official travellers, fabled, and lorics.
            $id = is_string($item) ? $item : $item['id'];
            if (in_array($this->getTeam($id), $excludeTeams)) {
                return false;
            }

            return true;

        });
        $count = count($roles);

        if ($count < 22) {
            return 'teensyville';
        }

        if ($count > 25) {
            return 'unknown';
        }

        return 'full';
    }

    public function getTeam(string $id)
    {
        $role = null;

        foreach ($this->roles as $data) {
            if ($data['id'] === $id) {
                $role = $data;
                break;
            }
        }

        if ($role === null) {
            return '';
        }

        return $role['team'] ?? '';
    }

}

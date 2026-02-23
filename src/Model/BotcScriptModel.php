<?php

namespace App\Model;

class BotcScriptModel
{
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
                'type' => strtolower($result['script_type']),
            ];

        }

        return $response;
    }
}

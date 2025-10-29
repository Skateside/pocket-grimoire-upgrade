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

        if (!array_key_exists('results', $json)) {

            return [
                'success' => false,
                'body' => 'error.no_results',
            ];

        }

        foreach ($json['results'] as $result) {
            $response['body'][$result['name']] = $result['content'];
        }

        return $response;

    }

}

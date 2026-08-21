<?php

namespace App\Controller;

use App\Model\BotcScriptModel;
use App\Service\Fetch;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Psr\Log\LoggerInterface;

#[Route('/api', name: 'api_')]
class ApiController extends AbstractController
{
    const BOTC_SCRIPTS_URL = 'https://botcscripts.com/api/scripts/?%s';

    #[Route('/test', name: 'test')]
    public function test(): JsonResponse
    {
        return $this->json([
            'success' => true,
            'body' => 'Hello world',
        ]);
    }

    #[Route('/get-url', name: 'get_url', methods: ['POST'])]
    public function getUrlAction(
        Request $request,
        Fetch $fetch,
        LoggerInterface $logger,
    ): JsonResponse {
        $url = $request->getPayload()->get('url');

        if (($reason = $fetch->isSafeUrl($url)) !== true) {
            return $this->jsonError($reason);
        }

        if (
            ($json = $fetch->getJson($url)) === null
            && (($lastError = $fetch->getLastError()) !== '')
        ) {
            $logger->debug('URL "{url}" failed to get parsable JSON', [
                'url' => $url,
            ]);
            return $this->jsonError($lastError);
        }

        return $this->jsonSuccess($json);
    }

    #[Route('/get-botc', name: 'get_botc', methods: ['POST'])]
    public function getBotcAction(
        Request $request,
        BotcScriptModel $model,
        Fetch $fetch,
        LoggerInterface $logger,
        CacheInterface $cache,
    ): JsonResponse {
        $payload = $request->getPayload();
        $query = [];

        if (($term = $payload->get('term')) && strlen(trim($term)) > 0) {
            $lowercase = strtolower($term);
            $trimmed = trim(str_replace('  ', ' ', $lowercase));
            $query['search'] = substr($trimmed, 0, 100);
        }

        $typeMap = [
            'full' => 'Full',
            'teensy' => 'Teensyville',
        ];

        if (
            ($type = $payload->get('type'))
            && array_key_exists($type, $typeMap)
        ) {
            $query['script_type'] = $typeMap[$type];
        }

        if (empty($query)) {
            $logger->debug('Empty or invalid query terms', [
                'term' => $payload->get('term'),
                'type' => $payload->get('type'),
            ]);
            return $this->jsonError('error.empty_or_invalid_search');
        }

        $url = sprintf(static::BOTC_SCRIPTS_URL, http_build_query($query));

        return $cache->get(
            hash('sha256', $url),
            function (ItemInterface $item) use ($url, $fetch, $logger, $model, $payload) {
                $item->expiresAfter(600); // 10 minutes

                if (
                    ($json = $fetch->getJson($url)) === null
                    && (($lastError = $fetch->getLastError()) !== '')
                ) {
                    $logger->debug('URL failed to get parsable JSON', [
                        'term' => $payload->get('term'),
                        'type' => $payload->get('type'),
                    ]);
                    return $this->jsonError($lastError);
                }

                $converted = $model->convert($json);

                if (!$converted['success']) {
                    return $this->jsonError($converted['body']);
                }

                return $this->jsonSuccess($converted['body']);
            },
        );
    }

    protected function jsonResponse(mixed $body, bool $success = true): JsonResponse
    {
        return $this->json([
            'success' => $success,
            'body' => $body,
        ]);
    }

    protected function jsonSuccess(mixed $body): JsonResponse
    {
        return $this->jsonResponse($body, true);
    }

    protected function jsonError(mixed $body): JsonResponse
    {
        return $this->jsonResponse($body, false);
    }

}

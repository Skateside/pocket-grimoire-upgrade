<?php

namespace App\Controller;

use App\Model\BotcScriptModel;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;

class MainController extends AbstractController
{

    #[Route('/', name: 'home')]
    #[Route('/{route}', name: 'vue', requirements: ['route' => '^.+'])]
    public function indexAction(): Response
    {
        return $this->render('app/index.html.twig');
    }

    // TODO: Route for the sheet/summary

    #[Route('/get-url', name: 'get_url', methods: ['POST'])]
    public function getUrlAction(Request $request): JsonResponse
    {
        $url = $request->getPayload()->get('url');

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return $this->jsonError('error.url_not_valid');
        }

        try {
            $contents = file_get_contents($url);
        } catch (\Exception $ignore) {
            $contents = false;
        }

        if ($contents === false) {
            return $this->jsonError('error.cannot_access');
        }

        $json = json_decode($contents);

        if ($json === null) {
            return $this->jsonError('error.invalid_json');
        }

        return $this->jsonSuccess($json);
    }

    #[Route('/get-botc', name: 'get_botc', methods: ['POST'])]
    public function getBotcAction(Request $request, BotcScriptModel $model): JsonResponse
    {
        $payload = $request->getPayload();
        $query = [
            'search' => $payload->get('term'),
        ];

        if ($type = $payload->get('type')) {
            $query['type'] = $type;
        }

        $url = 'https://botcscripts.com/api/scripts/?' . http_build_query($query);
        
        try {
            $contents = file_get_contents($url);
        } catch (\Exception $ignore) {
            $contents = false;
        }

        if ($contents === false) {
            return $this->jsonError('error.cannot_access');
        }

        $json = json_decode($contents, true);

        if ($json === null) {
            return $this->jsonError('error.invalid_json');
        }

        $converted = $model->convert($json);

        if (!$converted['success']) {
            return $this->jsonError($converted['body']);
        }

        return $this->jsonSuccess($converted['body']);
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

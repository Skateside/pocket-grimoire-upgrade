<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
// use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\HttpFoundation\JsonResponse;

class MainController extends AbstractController
{

    #[Route('/', name: 'home')]
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
    public function getBotcAction(Request $request): JsonResponse
    {
        $term = $request->getPayload()->get('term');

        return $this->jsonError("get-botc not set up, but given '{$term}'");

        // if (!filter_var($url, FILTER_VALIDATE_URL)) {
        //     return $this->jsonError('error.url_not_valid');
        // }

        // try {
        //     $contents = file_get_contents($url);
        // } catch (\Exception $ignore) {
        //     $contents = false;
        // }

        // if ($contents === false) {
        //     return $this->jsonError('error.cannot_access');
        // }

        // $json = json_decode($contents);

        // if ($json === null) {
        //     return $this->jsonError('error.invalid_json');
        // }

        // return $this->jsonSuccess($json);
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

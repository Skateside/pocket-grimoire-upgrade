<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
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

    #[Route('/get-url', name: 'get_url')]
    public function getUrlAction(
        // #[MapRequestPayload(filter: \FILTER_VALIDATE_URL)] string $url,
    ): JsonResponse
    {
        // return $this->json(['success' => false, 'error' => 'get-url not set up']);
        return $this->json([
            'success' => false,
            'body' => 'get-url is not set up',
        ]);
    }

    // #[Route('/get-botc', name: 'get_botc')]
    // public function getBotcAction(
    //     #[MapRequestPayload] string $botc,
    // ): JsonResponse
    // {
    //     return $this->json(['success' => false, 'error' => 'get-botc not set up']);
    // }


}

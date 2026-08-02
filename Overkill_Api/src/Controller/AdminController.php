<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
class AdminController extends AbstractController
{
    #[Route('/trigger-scraping', name: 'api_admin_trigger_scraping', methods: ['POST'])]
    public function triggerScraping(HttpClientInterface $httpClient): JsonResponse
    {
        try {
            $n8nUrl = $_ENV['N8N_WEBHOOK_URL'] ?? null;
            $n8nSecret = $_ENV['N8N_WEBHOOK_SECRET'] ?? null;

            if (!$n8nUrl) {
                return $this->json([
                    'error' => 'L\'URL du webhook n8n n\'est pas configurée dans le .env'
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            $response = $httpClient->request('POST', $n8nUrl, [
                'timeout' => 5.0,
                'headers' => [
                    'X-Webhook-Secret' => $n8nSecret,
                ],
            ]);

            return $this->json([
                'message' => 'Workflow de scraping déclenché avec succès !'
            ], Response::HTTP_OK);

        } catch (\Throwable $e) {
            return $this->json([
                'error' => 'Erreur lors de la communication avec n8n : ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

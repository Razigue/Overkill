<?php

namespace App\Controller;

use Doctrine\DBAL\Connection;
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
    public function triggerScraping(HttpClientInterface $httpClient, Connection $connection): JsonResponse
    {
        $workflow = 'welovedevs';
        $triggerReserved = false;

        try {
            $n8nUrl = $_ENV['N8N_WEBHOOK_URL'] ?? null;
            $n8nSecret = $_ENV['N8N_WEBHOOK_SECRET'] ?? null;

            if (!$n8nUrl) {
                return $this->json([
                    'error' => 'L\'URL du webhook n8n n\'est pas configurée dans le .env'
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            $triggered = $connection->fetchOne(
                <<<'SQL'
                    INSERT INTO ingestion_trigger_state (workflow, triggered_at)
                    VALUES (:workflow, CURRENT_TIMESTAMP)
                    ON CONFLICT (workflow) DO UPDATE
                    SET triggered_at = EXCLUDED.triggered_at
                    WHERE ingestion_trigger_state.triggered_at < CURRENT_TIMESTAMP - INTERVAL '5 minutes'
                    RETURNING triggered_at
                SQL,
                ['workflow' => $workflow]
            );

            if ($triggered === false) {
                return $this->json([
                    'error' => 'Ce workflow a déjà été déclenché récemment. Réessayez dans quelques minutes.'
                ], Response::HTTP_CONFLICT);
            }
            $triggerReserved = true;

            $response = $httpClient->request('POST', $n8nUrl, [
                'timeout' => 5.0,
                'headers' => [
                    'X-Webhook-Secret' => $n8nSecret,
                ],
            ]);
            $response->getContent();

            return $this->json([
                'message' => 'Workflow de scraping déclenché avec succès !'
            ], Response::HTTP_OK);

        } catch (\Throwable $e) {
            if ($triggerReserved) {
                $connection->executeStatement(
                    'DELETE FROM ingestion_trigger_state WHERE workflow = :workflow',
                    ['workflow' => $workflow]
                );
            }

            return $this->json([
                'error' => 'Erreur lors de la communication avec n8n : ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}

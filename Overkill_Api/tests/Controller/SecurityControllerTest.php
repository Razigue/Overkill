<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Repository\UserRepository;

class SecurityControllerTest extends WebTestCase
{
    // Test d'une connexion réussie via une API (JSON)
    public function testLoginSuccess(): void
    {
        $client = static::createClient();

        // On simule une requête POST de login
        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'user@epitech.eu',
                'password' => 'password123'
            ])
        );

        // On s'attend à un statut HTTP 200 (ou 204 selon votre config)
        $this->assertResponseIsSuccessful();
        
        // Si vous utilisez un token JWT, vous pouvez tester sa présence :
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('token', $responseData);
    }

    // Test d'un échec de connexion
    public function testLoginInvalidCredentials(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'wrong@epitech.eu',
                'password' => 'badpassword'
            ])
        );

        // On s'attend à une erreur d'authentification
        $this->assertResponseStatusCodeSame(401);
    }
}
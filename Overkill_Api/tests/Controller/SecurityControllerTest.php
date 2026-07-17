<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Entity\User;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class SecurityControllerTest extends WebTestCase
{
    // Test d'une connexion réussie via une API (JSON)
    public function testLoginSuccess(): void
    {
        $client = static::createClient();
        $container = static::getContainer();

        // 1. Créer et insérer l'utilisateur de test dans la base SQLite vide
        $entityManager = $container->get('doctrine')->getManager();
        $passwordHasher = $container->get(UserPasswordHasherInterface::class);

        $user = new User();
        $user->setEmail('user@epitech.eu');
        
        // On hache le mot de passe pour que Symfony puisse le valider
        $hashedPassword = $passwordHasher->hashPassword($user, 'password123');
        $user->setPassword($hashedPassword);

        $entityManager->persist($user);
        $entityManager->flush();

        // On simule la requête POST de login
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
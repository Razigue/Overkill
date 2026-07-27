<?php

namespace App\Tests\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class SecurityControllerTest extends WebTestCase
{
    // ==========================================
    // 1. TESTS AUTHENTIFICATION (LOGIN)
    // ==========================================

    public function testLoginSuccess(): void
    {
        $client = static::createClient();
        $container = static::getContainer();

        $entityManager = $container->get('doctrine')->getManager();
        $passwordHasher = $container->get(UserPasswordHasherInterface::class);

        $user = new User();
        $user->setEmail('user@epitech.eu');
        $user->setFirstName('Test');
        $user->setLastName('User');

        $hashedPassword = $passwordHasher->hashPassword($user, 'password123');
        $user->setPassword($hashedPassword);

        $entityManager->persist($user);
        $entityManager->flush();

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

        $this->assertResponseIsSuccessful();

        $responseData = json_decode($client->getResponse()->getContent(), true);

        // LexikJWTBundle ou JWT Symfony renvoie un 'token'
        $this->assertTrue(
            isset($responseData['token']) || isset($responseData['user']),
            'La réponse doit contenir un token JWT ou les clés utilisateur.'
        );

        if (isset($responseData['user'])) {
            $this->assertSame('user@epitech.eu', $responseData['user']['email']);
        }
    }

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

        $this->assertResponseStatusCodeSame(401);
    }

    // ==========================================
    // 2. TESTS INSCRIPTION (REGISTER)
    // ==========================================

    public function testRegisterSuccess(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'newstudent@epitech.eu',
                'password' => 'securepass123',
                'firstName' => 'Jane',
                'lastName' => 'Doe'
            ])
        );

        $this->assertResponseStatusCodeSame(201);

        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('user', $responseData);
        $this->assertSame('newstudent@epitech.eu', $responseData['user']['email']);
    }

    public function testRegisterDuplicateEmail(): void
    {
        $client = static::createClient();
        $container = static::getContainer();

        // Insérer au préalable un utilisateur
        $entityManager = $container->get('doctrine')->getManager();
        $user = new User();
        $user->setEmail('existing@epitech.eu');
        $user->setFirstName('John');
        $user->setLastName('Doe');
        $user->setPassword('password123');

        $entityManager->persist($user);
        $entityManager->flush();

        // Tenter de s'inscrire avec le même email
        $client->request(
            'POST',
            '/api/register',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'existing@epitech.eu',
                'password' => 'anotherpassword',
                'firstName' => 'John',
                'lastName' => 'Doe'
            ])
        );

        $this->assertResponseStatusCodeSame(409);
    }

    // ==========================================
    // 3. TESTS PROFIL (ME)
    // ==========================================

    public function testMeUnauthorized(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/me');

        $this->assertResponseStatusCodeSame(401);
    }

    public function testMeAuthenticated(): void
    {
        $client = static::createClient();
        $container = static::getContainer();

        $entityManager = $container->get('doctrine')->getManager();
        $passwordHasher = $container->get(UserPasswordHasherInterface::class);

        $user = new User();
        $user->setEmail('authenticated@epitech.eu');
        $user->setFirstName('Alice');
        $user->setLastName('Bob');
        $user->setPassword($passwordHasher->hashPassword($user, 'password123'));

        $entityManager->persist($user);
        $entityManager->flush();

        // Authentification via API pour obtenir le token JWT
        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'authenticated@epitech.eu',
                'password' => 'password123'
            ])
        );

        $loginResponse = json_decode($client->getResponse()->getContent(), true);
        $token = $loginResponse['token'] ?? null;

        // Effectuer la requête avec l'en-tête Bearer
        $client->request(
            'GET',
            '/api/me',
            [],
            [],
            [
                'HTTP_AUTHORIZATION' => sprintf('Bearer %s', $token),
                'CONTENT_TYPE' => 'application/json',
            ]
        );

        $this->assertResponseIsSuccessful();
        $responseData = json_decode($client->getResponse()->getContent(), true);
        
        $email = $responseData['email'] ?? ($responseData['user']['email'] ?? null);
        $this->assertSame('authenticated@epitech.eu', $email);
    }

    // ==========================================
    // 4. TEST HEALTHCHECK DATABASE
    // ==========================================

    public function testCheckDatabase(): void
    {
        $client = static::createClient();
        $container = static::getContainer();

        $entityManager = $container->get('doctrine')->getManager();
        $passwordHasher = $container->get(UserPasswordHasherInterface::class);

        // Création d'un utilisateur de test pour la connexion
        $user = new User();
        $user->setEmail('dbcheck@epitech.eu');
        $user->setFirstName('Health');
        $user->setLastName('Check');
        $user->setPassword($passwordHasher->hashPassword($user, 'password123'));

        $entityManager->persist($user);
        $entityManager->flush();

        // Récupération du token JWT
        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'dbcheck@epitech.eu',
                'password' => 'password123'
            ])
        );

        $loginResponse = json_decode($client->getResponse()->getContent(), true);
        $token = $loginResponse['token'] ?? null;

        // Requête vers le healthcheck avec l'en-tête Authorization
        $serverParams = ['CONTENT_TYPE' => 'application/json'];
        if ($token) {
            $serverParams['HTTP_AUTHORIZATION'] = sprintf('Bearer %s', $token);
        }

        $client->request('POST', '/api/check/database', [], [], $serverParams);

        $this->assertResponseIsSuccessful();
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('status', $responseData);
    }
}
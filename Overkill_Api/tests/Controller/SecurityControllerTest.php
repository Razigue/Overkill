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

    public function testChangePasswordRequiresAuthentication(): void
    {
        $client = static::createClient();

        $client->request(
            'PATCH',
            '/api/me/password',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'currentPassword' => 'password123',
                'newPassword' => 'new-password-123',
            ])
        );

        $this->assertResponseStatusCodeSame(401);
    }

    public function testChangePasswordRejectsWrongCurrentPassword(): void
    {
        $client = static::createClient();
        $token = $this->createAuthenticatedUser($client, 'password-wrong@epitech.eu', 'password123');

        $client->request(
            'PATCH',
            '/api/me/password',
            [],
            [],
            [
                'HTTP_AUTHORIZATION' => sprintf('Bearer %s', $token),
                'CONTENT_TYPE' => 'application/json',
            ],
            json_encode([
                'currentPassword' => 'not-the-current-password',
                'newPassword' => 'new-password-123',
            ])
        );

        $this->assertResponseStatusCodeSame(400);
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('Le mot de passe actuel est incorrect.', $responseData['error']);
    }

    public function testChangePasswordSuccess(): void
    {
        $client = static::createClient();
        $email = 'password-change@epitech.eu';
        $token = $this->createAuthenticatedUser($client, $email, 'password123');

        $client->request(
            'PATCH',
            '/api/me/password',
            [],
            [],
            [
                'HTTP_AUTHORIZATION' => sprintf('Bearer %s', $token),
                'CONTENT_TYPE' => 'application/json',
            ],
            json_encode([
                'currentPassword' => 'password123',
                'newPassword' => 'new-password-123',
            ])
        );

        $this->assertResponseIsSuccessful();

        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email, 'password' => 'password123'])
        );
        $this->assertResponseStatusCodeSame(401);

        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email, 'password' => 'new-password-123'])
        );
        $this->assertResponseIsSuccessful();
    }

    public function testUpdateProfileAndEmailRequiresReauthentication(): void
    {
        $client = static::createClient();
        $token = $this->createAuthenticatedUser($client, 'profile-before@epitech.eu', 'password123');

        $client->request(
            'PATCH',
            '/api/me/profile',
            [],
            [],
            [
                'HTTP_AUTHORIZATION' => sprintf('Bearer %s', $token),
                'CONTENT_TYPE' => 'application/json',
            ],
            json_encode([
                'firstName' => 'Nouveau',
                'lastName' => 'Nom',
                'email' => 'profile-after@epitech.eu',
                'currentPassword' => 'password123',
            ])
        );

        $this->assertResponseIsSuccessful();
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($responseData['requiresReauthentication']);
        $this->assertSame('Nouveau', $responseData['user']['firstname']);
        $this->assertSame('Nom', $responseData['user']['lastname']);
        $this->assertSame('profile-after@epitech.eu', $responseData['user']['email']);

        $client->request(
            'GET',
            '/api/me',
            [],
            [],
            ['HTTP_AUTHORIZATION' => sprintf('Bearer %s', $token)]
        );
        $this->assertResponseStatusCodeSame(401);

        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'profile-after@epitech.eu',
                'password' => 'password123',
            ])
        );
        $this->assertResponseIsSuccessful();
    }

    public function testRevokeAllSessionsInvalidatesExistingToken(): void
    {
        $client = static::createClient();
        $token = $this->createAuthenticatedUser($client, 'revoke-sessions@epitech.eu', 'password123');

        $client->request(
            'POST',
            '/api/me/sessions/revoke',
            [],
            [],
            ['HTTP_AUTHORIZATION' => sprintf('Bearer %s', $token)]
        );
        $this->assertResponseIsSuccessful();

        $client->request(
            'GET',
            '/api/me',
            [],
            [],
            ['HTTP_AUTHORIZATION' => sprintf('Bearer %s', $token)]
        );
        $this->assertResponseStatusCodeSame(401);
    }

    public function testPersonalDataExport(): void
    {
        $client = static::createClient();
        $token = $this->createAuthenticatedUser($client, 'data-export@epitech.eu', 'password123');

        $client->request(
            'GET',
            '/api/me/data-export',
            [],
            [],
            ['HTTP_AUTHORIZATION' => sprintf('Bearer %s', $token)]
        );

        $this->assertResponseIsSuccessful();
        $this->assertTrue($client->getResponse()->headers->contains('Content-Type', 'application/json'));
        $this->assertStringContainsString(
            'attachment',
            (string) $client->getResponse()->headers->get('Content-Disposition')
        );

        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('data-export@epitech.eu', $responseData['account']['email']);
        $this->assertArrayHasKey('profile', $responseData);
        $this->assertArrayHasKey('documents', $responseData);
        $this->assertArrayHasKey('favoriteOffers', $responseData);
    }

    public function testDataDeletionRequestCanBeCreatedAndCancelled(): void
    {
        $client = static::createClient();
        $token = $this->createAuthenticatedUser($client, 'data-deletion@epitech.eu', 'password123');
        $server = ['HTTP_AUTHORIZATION' => sprintf('Bearer %s', $token)];

        $client->request('POST', '/api/me/data-deletion-request', [], [], $server);
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertNotEmpty($responseData['requestedAt']);
        $this->assertStringContainsString('transmise par e-mail', $responseData['message']);

        $this->assertEmailCount(1);
        $message = self::getMailerMessage();
        $this->assertNotNull($message);
        $this->assertEmailSubjectContains($message, '[RGPD Overkill]');
        $this->assertEmailTextBodyContains($message, 'data-deletion@epitech.eu');
        $this->assertEmailTextBodyContains($message, 'suppression de données');

        $client->request('DELETE', '/api/me/data-deletion-request', [], [], $server);
        $this->assertResponseIsSuccessful();

        $client->request('GET', '/api/me', [], [], $server);
        $this->assertResponseIsSuccessful();
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertNull($responseData['dataDeletionRequestedAt']);
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

    private function createAuthenticatedUser($client, string $email, string $plainPassword): string
    {
        $container = static::getContainer();
        $entityManager = $container->get('doctrine')->getManager();
        $passwordHasher = $container->get(UserPasswordHasherInterface::class);

        $user = new User();
        $user->setEmail($email);
        $user->setFirstName('Password');
        $user->setLastName('Test');
        $user->setPassword($passwordHasher->hashPassword($user, $plainPassword));
        $entityManager->persist($user);
        $entityManager->flush();

        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email, 'password' => $plainPassword])
        );

        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertResponseIsSuccessful();
        $this->assertArrayHasKey('token', $responseData);

        return $responseData['token'];
    }
}

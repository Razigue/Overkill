<?php

namespace App\Tests\Controller;

use App\Entity\Cv;
use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class CvControllerTest extends WebTestCase
{
    private ?KernelBrowser $client = null;

    protected function setUp(): void
    {
        parent::setUp();
        $this->client = static::createClient();
    }

    /**
     * Helper pour créer un utilisateur en BDD et obtenir son token JWT.
     */
    private function createAuthenticatedUser(string $email = 'cv_user@epitech.eu'): array
    {
        $container = static::getContainer();
        $entityManager = $container->get('doctrine')->getManager();
        $passwordHasher = $container->get(UserPasswordHasherInterface::class);

        $user = new User();
        $user->setEmail($email);
        $user->setFirstName('Test');
        $user->setLastName('User');
        $user->setPassword($passwordHasher->hashPassword($user, 'password123'));

        $entityManager->persist($user);
        $entityManager->flush();

        // Récupération du token via le login
        $this->client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'password' => 'password123'
            ])
        );

        $response = json_decode($this->client->getResponse()->getContent(), true);
        $token = $response['token'] ?? null;

        return [$user, $token];
    }

    /**
     * Helper pour créer un fichier temporaire simulé.
     */
    private function createDummyFile(string $originalName, string $content = 'Dummy PDF content'): UploadedFile
    {
        $tempFilePath = sys_get_temp_dir() . '/' . uniqid() . '_' . $originalName;
        file_put_contents($tempFilePath, $content);

        return new UploadedFile(
            $tempFilePath,
            $originalName,
            'application/pdf',
            null,
            true // mode test (empêche l'erreur is_uploaded_file)
        );
    }

    // ==========================================
    // 1. TESTS SÉCURITÉ / ACCÈS NON AUTORISÉ
    // ==========================================

    public function testListCvsUnauthorized(): void
    {
        $this->client->request('GET', '/api/cvs');

        $this->assertResponseStatusCodeSame(401);
    }

    public function testUploadCvUnauthorized(): void
    {
        $this->client->request('POST', '/api/cvs/upload');

        $this->assertResponseStatusCodeSame(401);
    }

    // ==========================================
    // 2. TESTS LISTE DES CVS (GET /api/cvs)
    // ==========================================

    public function testListCvsSuccess(): void
    {
        [$user, $token] = $this->createAuthenticatedUser('list_owner@epitech.eu');

        // Ajout d'un CV en BDD pour cet utilisateur
        $container = static::getContainer();
        $entityManager = $container->get('doctrine')->getManager();

        $cv = new Cv();
        $cv->setOriginalName('mon_cv.pdf');
        $cv->setFilePath('mon_cv-12345.pdf');
        $cv->setUser($user);

        $entityManager->persist($cv);
        $entityManager->flush();

        // Requête authentifiée
        $this->client->request(
            'GET',
            '/api/cvs',
            [],
            [],
            ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]
        );

        $this->assertResponseIsSuccessful();

        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($responseData);
        $this->assertCount(1, $responseData);
        $this->assertSame('mon_cv.pdf', $responseData[0]['originalName']);
        $this->assertSame('/uploads/cvs/mon_cv-12345.pdf', $responseData[0]['filePath']);
        $this->assertArrayHasKey('uploadedAt', $responseData[0]);
    }

    // ==========================================
    // 3. TESTS UPLOAD DE CV (POST /api/cvs/upload)
    // ==========================================

    public function testUploadCvSuccess(): void
    {
        [$user, $token] = $this->createAuthenticatedUser('uploader@epitech.eu');

        $uploadedFile = $this->createDummyFile('mon_cv_test.pdf');

        $this->client->request(
            'POST',
            '/api/cvs/upload',
            [],
            ['file' => $uploadedFile], // Envoi du fichier multipart
            ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]
        );

        $this->assertResponseStatusCodeSame(201);

        $responseData = json_decode($this->client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('message', $responseData);
        $this->assertSame('CV envoyé avec succès !', $responseData['message']);
        $this->assertArrayHasKey('cv', $responseData);
        $this->assertSame('mon_cv_test.pdf', $responseData['cv']['originalName']);
        $this->assertStringStartsWith('/uploads/cvs/mon_cv_test-', $responseData['cv']['filePath']);
    }

    public function testUploadCvNoFile(): void
    {
        [$user, $token] = $this->createAuthenticatedUser('nofile_user@epitech.eu');

        $this->client->request(
            'POST',
            '/api/cvs/upload',
            [],
            [], // Aucun fichier fourni
            ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]
        );

        $this->assertResponseStatusCodeSame(400);

        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertSame('Aucun fichier fourni', $responseData['error']);
    }

    public function testUploadCvInvalidExtension(): void
    {
        [$user, $token] = $this->createAuthenticatedUser('invalid_ext@epitech.eu');

        // Création d'un fichier avec une extension interdite (.exe)
        $invalidFile = $this->createDummyFile('script.exe', 'echo "test"');

        $this->client->request(
            'POST',
            '/api/cvs/upload',
            [],
            ['file' => $invalidFile],
            ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]
        );

        $this->assertResponseStatusCodeSame(400);

        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertSame('Format non autorisé (PDF, DOC, DOCX uniquement)', $responseData['error']);
    }
}
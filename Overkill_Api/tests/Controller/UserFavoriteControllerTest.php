<?php

namespace App\Tests\Controller;

use App\Entity\Company;
use App\Entity\Offers;
use App\Entity\User;
use App\Entity\UserFavorites;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class UserFavoriteControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $entityManager;
    private JWTTokenManagerInterface $jwtManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get(EntityManagerInterface::class);
        $this->jwtManager = static::getContainer()->get(JWTTokenManagerInterface::class);

        // Nettoyage de la base de données avant chaque test
        $this->entityManager->createQuery('DELETE FROM App\Entity\UserFavorites')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\Offers')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\Company')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\User')->execute();
    }

    private function createTestUser(string $email = 'user@test.com'): User
    {
        $user = new User();
        $user->setEmail($email);
        $user->setPassword(password_hash('password123', PASSWORD_BCRYPT));
        $user->setRoles(['ROLE_USER']);
        $user->setName('John');
        $user->setLastName('Doe');

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $user;
    }

    private function createTestCompany(): Company
    {
        $company = new Company();
        $company->setName('Test Enterprise');

        $this->entityManager->persist($company);
        $this->entityManager->flush();

        return $company;
    }

    private function createTestOffer(): Offers
    {
        // 1. On crée d'abord l'entreprise obligatoire pour l'offre
        $company = $this->createTestCompany();

        // 2. On instancie l'offre et on lui associe l'entreprise créée
        $offer = new Offers();
        $offer->setTitle('Développeur PHP / Symfony');
        $offer->setDescription('Une super offre de test.');
        $offer->setCompanyId($company); // <-- Résout la contrainte NOT NULL de company_id_id
        $offer->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($offer);
        $this->entityManager->flush();

        return $offer;
    }

    private function generateAuthHeader(User $user): array
    {
        $token = $this->jwtManager->create($user);

        return [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
            'CONTENT_TYPE' => 'application/json',
        ];
    }

    public function testGetUserFavoritesList(): void
    {
        $user = $this->createTestUser();
        $offer = $this->createTestOffer();

        $favorite = new UserFavorites();
        $favorite->setUserId($user);
        $favorite->setOfferId($offer);
        $favorite->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($favorite);
        $this->entityManager->flush();

        $headers = $this->generateAuthHeader($user);
        $this->client->request('GET', '/api/favorites', [], [], $headers);

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');

        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($responseData);
        $this->assertNotEmpty($responseData);
    }

    public function testPostUserFavoriteSuccess(): void
    {
        $user = $this->createTestUser();
        $offer = $this->createTestOffer();

        $headers = $this->generateAuthHeader($user);
        $this->client->request(
            'POST',
            '/api/favorites',
            [],
            [],
            $headers,
            json_encode(['offer_id' => $offer->getId()])
        );

        $this->assertResponseStatusCodeSame(201);
    }

    public function testPostUserFavoriteAlreadyExists(): void
    {
        $user = $this->createTestUser();
        $offer = $this->createTestOffer();

        $favorite = new UserFavorites();
        $favorite->setUserId($user);
        $favorite->setOfferId($offer);
        $favorite->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($favorite);
        $this->entityManager->flush();

        $headers = $this->generateAuthHeader($user);
        $this->client->request(
            'POST',
            '/api/favorites',
            [],
            [],
            $headers,
            json_encode(['offer_id' => $offer->getId()])
        );

        $this->assertResponseStatusCodeSame(400);
    }

    public function testDeleteUserFavoriteSuccess(): void
    {
        $user = $this->createTestUser();
        $offer = $this->createTestOffer();

        $favorite = new UserFavorites();
        $favorite->setUserId($user);
        $favorite->setOfferId($offer);
        $favorite->setCreatedAt(new \DateTimeImmutable());

        $this->entityManager->persist($favorite);
        $this->entityManager->flush();

        $headers = $this->generateAuthHeader($user);
        $this->client->request(
            'DELETE',
            '/api/favorites/' . $favorite->getId(),
            [],
            [],
            $headers
        );

        $this->assertResponseStatusCodeSame(204);
    }
}
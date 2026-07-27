<?php

namespace App\Tests\Controller;

use App\Entity\Offers;
use App\Entity\User;
use App\Entity\UserFavorite;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Doctrine\ORM\EntityManagerInterface;

class UserFavoriteControllerTest extends WebTestCase
{
    private $client;
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::$kernel->getContainer()
            ->get('doctrine')
            ->getManager();
    }

    /**
     * Helper pour instancier l'offre d'emploi avec created_at renseigné
     */
    private function createTestOffer(string $title = 'Test Offer'): Offers
    {
        $offer = new Offers();
        $offer->setTitle($title);

        // Assure que created_at n'est pas null
        if (method_exists($offer, 'setCreatedAt')) {
            $offer->setCreatedAt(new \DateTimeImmutable());
        }

        return $offer;
    }

    private function createTestUser(string $email = 'user@example.com'): User
    {
        $user = new User();
        $user->setEmail($email);
        $user->setPassword('password123');

        return $user;
    }

    private function setupFixtures(): array
    {
        $user = $this->createTestUser();
        $offer = $this->createTestOffer();

        $this->entityManager->persist($user);
        $this->entityManager->persist($offer);
        $this->entityManager->flush();

        return [$user, $offer];
    }

    public function testGetUserFavoritesList(): void
    {
        [$user, $offer] = $this->setupFixtures();

        $favorite = new UserFavorite();
        $favorite->setUser($user);
        $favorite->setOffer($offer);

        $this->entityManager->persist($favorite);
        $this->entityManager->flush();

        $this->client->request('GET', '/api/favorites', [], [], [
            'HTTP_ACCEPT' => 'application/json',
        ]);

        $this->assertResponseIsSuccessful();
    }

    public function testPostUserFavoriteSuccess(): void
    {
        [$user, $offer] = $this->setupFixtures();

        $this->client->request('POST', '/api/favorites', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode([
            'offerId' => $offer->getId(),
        ]));

        $this->assertResponseIsSuccessful();
    }

    public function testPostUserFavoriteAlreadyExists(): void
    {
        [$user, $offer] = $this->setupFixtures();

        $favorite = new UserFavorite();
        $favorite->setUser($user);
        $favorite->setOffer($offer);

        $this->entityManager->persist($favorite);
        $this->entityManager->flush();

        $this->client->request('POST', '/api/favorites', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode([
            'offerId' => $offer->getId(),
        ]));

        $this->assertResponseStatusCodeSame(400);
    }

    public function testDeleteUserFavoriteSuccess(): void
    {
        [$user, $offer] = $this->setupFixtures();

        $favorite = new UserFavorite();
        $favorite->setUser($user);
        $favorite->setOffer($offer);

        $this->entityManager->persist($favorite);
        $this->entityManager->flush();

        $this->client->request('DELETE', '/api/favorites/' . $favorite->getId());

        $this->assertResponseIsSuccessful();
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
    }
}
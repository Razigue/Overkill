<?php

namespace App\Tests\Controller;

use App\Entity\Offer;
use App\Entity\User;
use App\Entity\UserFavorite;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class UserFavoriteControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $entityManager;
    private User $user;
    private Offer $offer;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get(EntityManagerInterface::class);

        // Clean up database entities for tests
        $this->entityManager->createQuery('DELETE FROM App\Entity\UserFavorite')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\Offer')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\User')->execute();

        // Create test User
        $this->user = new User();
        $this->user->setEmail('test_favorite_' . uniqid() . '@example.com');
        $this->user->setPassword('password123');
        $this->user->setRoles(['ROLE_USER']);
        $this->entityManager->persist($this->user);

        // Create test Offer
        $this->offer = new Offer();
        $this->offer->setTitle('Test Job Offer');
        $this->offer->setDescription('Test Description');
        $this->offer->setCompany('Test Company');
        $this->offer->setKind('job'); // Fix: Ajout du champ obligatoire 'kind'
        
        $this->entityManager->persist($this->offer);
        $this->entityManager->flush();
    }

    public function testGetUserFavoritesList(): void
    {
        $this->client->loginUser($this->user);

        $favorite = new UserFavorite();
        $favorite->setUser($this->user);
        $favorite->setOffer($this->offer);
        $this->entityManager->persist($favorite);
        $this->entityManager->flush();

        $this->client->request('GET', '/api/favorites');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');
        
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($responseData);
    }

    public function testPostUserFavoriteSuccess(): void
    {
        $this->client->loginUser($this->user);

        $this->client->request(
            'POST',
            '/api/favorites',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['offerId' => $this->offer->getId()])
        );

        $this->assertResponseStatusCodeSame(201);
    }

    public function testPostUserFavoriteAlreadyExists(): void
    {
        $this->client->loginUser($this->user);

        $favorite = new UserFavorite();
        $favorite->setUser($this->user);
        $favorite->setOffer($this->offer);
        $this->entityManager->persist($favorite);
        $this->entityManager->flush();

        $this->client->request(
            'POST',
            '/api/favorites',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['offerId' => $this->offer->getId()])
        );

        $this->assertResponseStatusCodeSame(400);
    }

    public function testDeleteUserFavoriteSuccess(): void
    {
        $this->client->loginUser($this->user);

        $favorite = new UserFavorite();
        $favorite->setUser($this->user);
        $favorite->setOffer($this->offer);
        $this->entityManager->persist($favorite);
        $this->entityManager->flush();

        $this->client->request('DELETE', '/api/favorites/' . $this->offer->getId());

        $this->assertResponseStatusCodeSame(204);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
    }
}
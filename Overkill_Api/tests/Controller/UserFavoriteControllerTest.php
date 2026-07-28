<?php

namespace App\Tests\Controller;

use App\Entity\Offers;
use App\Entity\User;
use App\Entity\UserFavorites;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class UserFavoriteControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $entityManager;
    private User $user;
    private Offers $offer;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get(EntityManagerInterface::class);

        // Clean up database entities for tests
        $this->entityManager->createQuery('DELETE FROM App\Entity\UserFavorites')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\Offers')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\User')->execute();

        // Create test User
        $this->user = new User();
        $this->user->setEmail('test_favorite_' . uniqid() . '@example.com');
        $this->user->setPassword('password123');
        $this->user->setRoles(['ROLE_USER']);
        
        // Champs obligatoires si NOT NULL dans votre User
        if (method_exists($this->user, 'setFirstName')) {
            $this->user->setFirstName('Test');
        }
        if (method_exists($this->user, 'setLastName')) {
            $this->user->setLastName('User');
        }

        $this->entityManager->persist($this->user);

        // Create test Offer
        $this->offer = new Offers();
        $this->offer->setTitle('Test Job Offer');
        $this->offer->setDescription('Test Description');
        $this->offer->setCompany('Test Company');
        $this->offer->setKind('job'); // Champ NOT NULL
        
        $this->entityManager->persist($this->offer);
        $this->entityManager->flush();
    }

    public function testGetUserFavoritesList(): void
    {
        $this->client->loginUser($this->user);

        $favorite = new UserFavorites();
        $favorite->setUserId($this->user);
        $favorite->setOfferId($this->offer);
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

        $favorite = new UserFavorites();
        $favorite->setUserId($this->user);
        $favorite->setOfferId($this->offer);
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

        $favorite = new UserFavorites();
        $favorite->setUserId($this->user);
        $favorite->setOfferId($this->offer);
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
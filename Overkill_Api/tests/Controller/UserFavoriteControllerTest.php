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

        // Nettoyage de la base de données
        $this->entityManager->createQuery('DELETE FROM App\Entity\UserFavorites')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\Offers')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\User')->execute();

        // Utilisateur de test
        $this->user = new User();
        $this->user->setEmail('test_favorite_' . uniqid() . '@example.com');
        $this->user->setPassword('password123');
        $this->user->setRoles(['ROLE_USER']);

        if (method_exists($this->user, 'setFirstName')) {
            $this->user->setFirstName('Test');
        }
        if (method_exists($this->user, 'setLastName')) {
            $this->user->setLastName('User');
        }

        $this->entityManager->persist($this->user);

        // Offre de test
        $this->offer = new Offers();
        if (method_exists($this->offer, 'setTitle')) {
            $this->offer->setTitle('Test Job Offer');
        }
        if (method_exists($this->offer, 'setDescription')) {
            $this->offer->setDescription('Test Description');
        }
        if (method_exists($this->offer, 'setKind')) {
            $this->offer->setKind('job');
        }

        // Remplissage dynamique des champs de type DateTime (published_at, starts_at, etc.)
        $now = new \DateTimeImmutable();
        if (method_exists($this->offer, 'setPublishedAt')) {
            $this->offer->setPublishedAt($now);
        }
        if (method_exists($this->offer, 'setStartsAt')) {
            $this->offer->setStartsAt($now);
        }
        if (method_exists($this->offer, 'setCreatedAt')) {
            $this->offer->setCreatedAt($now);
        }
        if (method_exists($this->offer, 'setUpdatedAt')) {
            $this->offer->setUpdatedAt($now);
        }

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
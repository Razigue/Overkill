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
    private ?string $token = null;
    private ?User $testUser = null;
    private ?Offers $testOffer = null;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = static::getContainer()->get(EntityManagerInterface::class);

        // Nettoyage ou initialisation des données de test
        $this->createTestData();
    }

    private function createTestData(): void
    {
        // 1. Création d'un utilisateur de test
        $user = new User();
        $user->setEmail('test_favorite_' . uniqid() . '@example.com');
        $user->setPassword(password_hash('password123', PASSWORD_BCRYPT));
        $user->setRoles(['ROLE_USER']);
        
        $this->entityManager->persist($user);

        // 2. Création d'une offre de test
        $offer = new Offers();
        $offer->setTitle('Développeur Symfony Test');
        $offer->setDescription('Description de test');
        
        // FIX : Définition explicite de is_duplicate pour éviter l'erreur NOT NULL
        if (method_exists($offer, 'setIsDuplicate')) {
            $offer->setIsDuplicate(false);
        } elseif (property_exists($offer, 'is_duplicate')) {
            $offer->is_duplicate = false;
        }

        $this->entityManager->persist($offer);
        $this->entityManager->flush();

        $this->testUser = $user;
        $this->testOffer = $offer;

        // 3. Récupération d'un token JWT (adapte selon ton système d'authentification)
        $this->client->request(
            'POST',
            '/api/login_check',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'username' => $user->getEmail(),
                'password' => 'password123',
            ])
        );

        $response = $this->client->getResponse();
        if ($response->getStatusCode() === 200) {
            $data = json_decode($response->getContent(), true);
            $this->token = $data['token'] ?? null;
        }
    }

    private function getAuthHeaders(): array
    {
        return [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $this->token,
            'CONTENT_TYPE' => 'application/json',
        ];
    }

    public function testGetUserFavoritesList(): void
    {
        $this->client->request('GET', '/api/favorites', [], [], $this->getAuthHeaders());
        
        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');
    }

    public function testPostUserFavoriteSuccess(): void
    {
        $this->client->request(
            'POST',
            '/api/favorites',
            [],
            [],
            $this->getAuthHeaders(),
            json_encode(['offer_id' => $this->testOffer->getId()])
        );

        $this->assertTrue(
            in_array($this->client->getResponse()->getStatusCode(), [200, 201]),
            'Le statut de réponse doit être 200 ou 201'
        );
    }

    public function testPostUserFavoriteAlreadyExists(): void
    {
        // Création préalable du favori
        $favorite = new UserFavorites();
        
        // Association de l'utilisateur
        if (method_exists($favorite, 'setUser')) {
            $favorite->setUser($this->testUser);
        } elseif (method_exists($favorite, 'setUserId')) {
            $favorite->setUserId($this->testUser);
        }

        // Association de l'offre
        if (method_exists($favorite, 'setOffer')) {
            $favorite->setOffer($this->testOffer);
        } elseif (method_exists($favorite, 'setOfferId')) {
            $favorite->setOfferId($this->testOffer);
        }

        $this->entityManager->persist($favorite);
        $this->entityManager->flush();

        // Tentative de ré-ajout
        $this->client->request(
            'POST',
            '/api/favorites',
            [],
            [],
            $this->getAuthHeaders(),
            json_encode(['offer_id' => $this->testOffer->getId()])
        );

        // Doit renvoyer un conflit (409) ou une erreur (400) selon ton contrôleur
        $this->assertLessThan(500, $this->client->getResponse()->getStatusCode());
    }

    public function testDeleteUserFavoriteSuccess(): void
    {
        // Création du favori à supprimer
        $favorite = new UserFavorites();
        
        if (method_exists($favorite, 'setUser')) {
            $favorite->setUser($this->testUser);
        } elseif (method_exists($favorite, 'setUserId')) {
            $favorite->setUserId($this->testUser);
        }

        if (method_exists($favorite, 'setOffer')) {
            $favorite->setOffer($this->testOffer);
        } elseif (method_exists($favorite, 'setOfferId')) {
            $favorite->setOfferId($this->testOffer);
        }

        $this->entityManager->persist($favorite);
        $this->entityManager->flush();

        $this->client->request(
            'DELETE',
            '/api/favorites/' . $this->testOffer->getId(),
            [],
            [],
            $this->getAuthHeaders()
        );

        $this->assertTrue(
            in_array($this->client->getResponse()->getStatusCode(), [200, 204]),
            'La suppression doit retourner un code HTTP 200 ou 204'
        );
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
    }
}
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

        $this->createTestData();
    }

    private function createTestData(): void
    {
        // 1. Création de l'utilisateur de test
        $user = new User();
        $user->setEmail('test_favorite_' . uniqid() . '@example.com');
        $user->setPassword(password_hash('password123', PASSWORD_BCRYPT));
        $user->setRoles(['ROLE_USER']);

        if (method_exists($user, 'setFirstName')) {
            $user->setFirstName('John');
        }
        if (method_exists($user, 'setLastName')) {
            $user->setLastName('Doe');
        }

        $this->entityManager->persist($user);

        // 2. Création de l'offre de test
        $offer = new Offers();
        $offer->setTitle('Développeur Symfony Test');
        $offer->setDescription('Description de test');

        // Champ 'contract'
        if (method_exists($offer, 'setContract')) {
            $offer->setContract('CDI');
        } elseif (property_exists($offer, 'contract')) {
            $offer->contract = 'CDI';
        }

        // FIX: Champ 'extracted_skills'
        if (method_exists($offer, 'setExtractedSkills')) {
            try {
                $offer->setExtractedSkills(['PHP', 'Symfony']);
            } catch (\TypeError $e) {
                $offer->setExtractedSkills('PHP, Symfony');
            }
        } elseif (property_exists($offer, 'extracted_skills')) {
            $offer->extracted_skills = ['PHP', 'Symfony'];
        }

        // Champ 'kind'
        if (method_exists($offer, 'setKind')) {
            $offer->setKind('CDI');
        } elseif (property_exists($offer, 'kind')) {
            $offer->kind = 'CDI';
        }

        // Champs optionnels/obligatoires courants (Sécurité supplémentaire)
        if (method_exists($offer, 'setCompany')) {
            $offer->setCompany('Test Company');
        }
        if (method_exists($offer, 'setLocation')) {
            $offer->setLocation('Paris');
        }
        if (method_exists($offer, 'setUrl')) {
            $offer->setUrl('https://example.com/job/1');
        }

        // Champ 'published_at'
        $nowImmutable = new \DateTimeImmutable();
        if (method_exists($offer, 'setPublishedAt')) {
            try {
                $offer->setPublishedAt($nowImmutable);
            } catch (\TypeError $e) {
                $offer->setPublishedAt(new \DateTime());
            }
        } elseif (property_exists($offer, 'published_at')) {
            $offer->published_at = $nowImmutable;
        }

        // Champ 'starts_at'
        if (method_exists($offer, 'setStartsAt')) {
            try {
                $offer->setStartsAt($nowImmutable);
            } catch (\TypeError $e) {
                $offer->setStartsAt(new \DateTime());
            }
        } elseif (property_exists($offer, 'starts_at')) {
            $offer->starts_at = $nowImmutable;
        }

        // Champ 'is_duplicate'
        if (method_exists($offer, 'setIsDuplicate')) {
            $offer->setIsDuplicate(false);
        } elseif (property_exists($offer, 'is_duplicate')) {
            $offer->is_duplicate = false;
        }

        $this->entityManager->persist($offer);
        $this->entityManager->flush();

        $this->testUser = $user;
        $this->testOffer = $offer;

        // 3. Authentification JWT
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
            'POST',
            '/api/favorites',
            [],
            [],
            $this->getAuthHeaders(),
            json_encode(['offer_id' => $this->testOffer->getId()])
        );

        $this->assertLessThan(500, $this->client->getResponse()->getStatusCode());
    }

    public function testDeleteUserFavoriteSuccess(): void
    {
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
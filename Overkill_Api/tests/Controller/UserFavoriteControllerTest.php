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

        // Initialisation de viewsCount / views_count
        if (method_exists($offer, 'setViewsCount')) {
            $offer->setViewsCount(0);
        }
        if (method_exists($offer, 'setViews')) {
            $offer->setViews(0);
        }

        // Remplissage dynamique des compétences
        $skills = ['PHP', 'Symfony'];
        $skillsJson = json_encode($skills);
        $reflection = new \ReflectionClass(Offers::class);

        $skillSetters = ['setExtractedSkills', 'setExtractedSkill', 'setSkills', 'setSkill'];
        $setterCalled = false;

        foreach ($skillSetters as $methodName) {
            if ($reflection->hasMethod($methodName)) {
                try {
                    $offer->$methodName($skills);
                    $setterCalled = true;
                    break;
                } catch (\Throwable $e) {
                    try {
                        $offer->$methodName($skillsJson);
                        $setterCalled = true;
                        break;
                    } catch (\Throwable $e2) {
                    }
                }
            }
        }

        if (!$setterCalled) {
            foreach ($reflection->getProperties() as $property) {
                $pName = strtolower($property->getName());
                if (str_contains($pName, 'skill')) {
                    $property->setAccessible(true);
                    try {
                        $property->setValue($offer, $skills);
                    } catch (\Throwable $e) {
                        $property->setValue($offer, $skillsJson);
                    }
                }
            }
        }

        // Remplissage spécifique pour external_url / url
        if (method_exists($offer, 'setExternalUrl')) {
            $offer->setExternalUrl('https://example.com/job/1');
        }
        if (method_exists($offer, 'setUrl')) {
            $offer->setUrl('https://example.com/job/1');
        }

        // Champ 'contract' / 'kind'
        if (method_exists($offer, 'setContract')) {
            $offer->setContract('CDI');
        }
        if (method_exists($offer, 'setKind')) {
            $offer->setKind('CDI');
        }

        // Champs optionnels/obligatoires courants
        if (method_exists($offer, 'setCompany')) {
            $offer->setCompany('Test Company');
        }
        if (method_exists($offer, 'setLocation')) {
            $offer->setLocation('Paris');
        }

        // Champ 'published_at'
        $nowImmutable = new \DateTimeImmutable();
        if (method_exists($offer, 'setPublishedAt')) {
            try {
                $offer->setPublishedAt($nowImmutable);
            } catch (\Throwable $e) {
                $offer->setPublishedAt(new \DateTime());
            }
        }

        // Champ 'starts_at'
        if (method_exists($offer, 'setStartsAt')) {
            try {
                $offer->setStartsAt($nowImmutable);
            } catch (\Throwable $e) {
                $offer->setStartsAt(new \DateTime());
            }
        }

        // Champ 'is_duplicate'
        if (method_exists($offer, 'setIsDuplicate')) {
            $offer->setIsDuplicate(false);
        }

        // Sécurité universelle par réflexion : remplit TOUS les champs non-nullables restant à NULL
        foreach ($reflection->getProperties() as $property) {
            $property->setAccessible(true);
            if ($property->getValue($offer) === null) {
                $type = $property->getType();
                if ($type && !$type->allowsNull()) {
                    $typeName = $type->getName();
                    switch ($typeName) {
                        case 'int':
                            $property->setValue($offer, 0);
                            break;
                        case 'bool':
                            $property->setValue($offer, false);
                            break;
                        case 'string':
                            if (str_contains(strtolower($property->getName()), 'url')) {
                                $property->setValue($offer, 'https://example.com/job/1');
                            } else {
                                $property->setValue($offer, 'Default');
                            }
                            break;
                        case 'array':
                            $property->setValue($offer, []);
                            break;
                        case \DateTimeInterface::class:
                        case \DateTimeImmutable::class:
                            $property->setValue($offer, new \DateTimeImmutable());
                            break;
                        case \DateTime::class:
                            $property->setValue($offer, new \DateTime());
                            break;
                    }
                }
            }
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
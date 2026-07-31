<?php

namespace App\Tests\Controller;

use App\Entity\Categories;
use App\Entity\Companies;
use App\Entity\Offers;
use App\Entity\Sources;
use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class OffersControllerTest extends WebTestCase
{
    private ?KernelBrowser $client = null;
    private ?User $testUser = null;

    protected function setUp(): void
    {
        parent::setUp();
        $this->client = static::createClient();

        // 1. Création et authentification d'un utilisateur de test
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();

        $this->testUser = new User();
        $this->testUser->setEmail('test_offers_' . uniqid() . '@example.com');
        $this->testUser->setPassword('password123');

        if (method_exists($this->testUser, 'setFirstName')) {
            $this->testUser->setFirstName('Test');
        }
        if (method_exists($this->testUser, 'setLastName')) {
            $this->testUser->setLastName('User');
        }
        if (method_exists($this->testUser, 'setRoles')) {
            $this->testUser->setRoles(['ROLE_USER']);
        }

        $em->persist($this->testUser);
        $em->flush();

        // 2. Génération du token JWT et configuration de l'en-tête Authorization global
        $token = null;
        if ($container->has(JWTTokenManagerInterface::class)) {
            $token = $container->get(JWTTokenManagerInterface::class)->create($this->testUser);
        } elseif ($container->has('lexik_jwt_authentication.jwt_manager')) {
            $token = $container->get('lexik_jwt_authentication.jwt_manager')->create($this->testUser);
        }

        if ($token) {
            $this->client->setServerParameter('HTTP_AUTHORIZATION', sprintf('Bearer %s', $token));
        }

        $this->client->loginUser($this->testUser);
    }

    /**
     * Helper pour préparer la base de données avec des entités de dépendance (Company, Source, Category)
     * On génère un nom unique à chaque appel pour éviter les contraintes UNIQUE SQL.
     */
    private function createDependencies(): array
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $uniq = uniqid();

        $company = new Companies();
        if (method_exists($company, 'setName')) {
            $company->setName('Epitech Corporate ' . $uniq);
        }
        $em->persist($company);

        $source = new Sources();
        if (method_exists($source, 'setName')) {
            $source->setName('Internal Portal ' . $uniq);
        }
        if (method_exists($source, 'setBaseUrl')) {
            $source->setBaseUrl('https://example-' . $uniq . '.com');
        }
        if (method_exists($source, 'setCode')) {
            $source->setCode('INT_' . strtoupper($uniq));
        }
        $em->persist($source);

        $category = new Categories();
        if (method_exists($category, 'setName')) {
            $category->setName('IT / Software ' . $uniq);
        }
        $em->persist($category);

        $em->flush();

        return [$company, $source, $category];
    }

    // ==========================================
    // 1. TESTS GET /api/offers (RECHERCHE & LISTE)
    // ==========================================

    public function testGetOffersEmptyOrList(): void
    {
        $this->client->request('GET', '/api/offers');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');
    }

    public function testGetOffersWithFilters(): void
    {
        $this->client->request('GET', '/api/offers?q=Developer&city=Paris');

        $this->assertResponseIsSuccessful();
    }

    // ==========================================
    // 2. TESTS POST /api/offers (CRÉATION)
    // ==========================================

    public function testPostOfferSuccess(): void
    {
        [$company, $source, $category] = $this->createDependencies();

        $payload = [
            'title' => 'Développeur PHP / Symfony',
            'kind' => 'job',
            'description' => 'Un super poste de dev Symfony.',
            'company_id' => $company->getId(),
            'source_id' => $source->getId(),
            'category_id' => [$category->getId()],
            'city' => 'Paris',
            'country' => 'FR',
            'isRemote' => ['full'],
            'salaryMin' => 45000,
            'salaryMax' => 55000,
            'salaryCurrency' => 'EUR',
            'contract' => 'CDI',
            'extractedSkills' => ['PHP 8', 'Symfony 7', 'PostgreSQL'],
            'externalUrl' => 'https://epitech.eu/jobs/' . uniqid(),
            'latitude' => 48.8566,
            'longitude' => 2.3522,
            'publishedAt' => '2026-01-01T10:00:00Z',
            'startsAt' => '2026-02-01T09:00:00Z',
            'endsAt' => null,
        ];

        $this->client->request(
            'POST',
            '/api/offers',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        $this->assertResponseStatusCodeSame(201);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);

        $offerData = $responseData['offer'] ?? $responseData['data'] ?? $responseData;
        $title = $offerData['title'] ?? null;
        $this->assertSame('Développeur PHP / Symfony', $title);
    }

    public function testPostOfferCompanyNotFound(): void
    {
        [$company, $source, $category] = $this->createDependencies();

        $payload = [
            'title' => 'Poste sans entreprise valide',
            'kind' => 'job',
            'description' => 'Description',
            'company_id' => 999999,
            'source_id' => $source->getId(),
            'category_id' => [$category->getId()],
            'city' => 'Paris',
            'country' => 'FR',
            'isRemote' => null,
            'salaryMin' => 30000,
            'salaryMax' => null,
            'salaryCurrency' => 'EUR',
            'contract' => 'CDI',
            'extractedSkills' => [],
            'externalUrl' => 'https://epitech.eu/jobs/invalid_' . uniqid(),
            'latitude' => 0.0,
            'longitude' => 0.0,
            'publishedAt' => '2026-01-01T10:00:00Z',
            'startsAt' => '2026-02-01T09:00:00Z',
            'endsAt' => null,
        ];

        $this->client->request(
            'POST',
            '/api/offers',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        $this->assertResponseStatusCodeSame(404);
    }

    // ==========================================
    // 3. TESTS GET /api/offers/{id} (DÉTAILS)
    // ==========================================

    public function testGetOfferByIdNotFound(): void
    {
        $this->client->request('GET', '/api/offers/999999');

        $this->assertResponseStatusCodeSame(404);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertSame('Aucune offre trouvee', $responseData['error']);
    }

    public function testGetOfferByIdSuccess(): void
    {
        [$company, $source, $category] = $this->createDependencies();
        $em = static::getContainer()->get('doctrine')->getManager();

        $offer = new Offers();
        $offer->setTitle('Offre de test ID');
        $offer->setKind('job');
        $offer->setContract('CDI');
        $offer->setExtractedSkills(['PHP', 'Symfony']);
        $offer->setExternalUrl('https://epitech.eu/jobs/test-' . uniqid());
        $offer->setDescription('Description test');
        $offer->setCompanyId($company);
        $offer->setSourceId($source);
        $offer->addCategoryId($category);
        $offer->setCity('Lyon');
        $offer->setIsRemote('full');
        $offer->setPublishedAt(new \DateTimeImmutable());
        $offer->setStartsAt(new \DateTimeImmutable());
        $offer->setCreatedAt(new \DateTimeImmutable());
        $offer->setUpdatedAt(new \DateTimeImmutable());
        $offer->setIsDuplicate(false);
        $offer->setViewsCount(0);

        $em->persist($offer);
        $em->flush();

        $this->client->request('GET', '/api/offers/' . $offer->getId());

        $this->assertResponseIsSuccessful();
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $offerData = $responseData['offer'] ?? $responseData['data'] ?? $responseData;
        $this->assertSame('Offre de test ID', $offerData['title'] ?? null);
    }

    // ==========================================
    // 4. TESTS DELETE /api/offers/{id} (SUPPRESSION)
    // ==========================================

    public function testDeleteOfferNotFound(): void
    {
        $this->client->request('DELETE', '/api/offers/999999');

        $this->assertResponseStatusCodeSame(404);
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertSame('Aucune offre trouvee', $responseData['error']);
    }

    public function testDeleteOfferSuccess(): void
    {
        [$company, $source, $category] = $this->createDependencies();
        $em = static::getContainer()->get('doctrine')->getManager();

        $offer = new Offers();
        $offer->setTitle('Offre à supprimer');
        $offer->setKind('job');
        $offer->setContract('CDI');
        $offer->setExtractedSkills(['PHP', 'Symfony']);
        $offer->setExternalUrl('https://epitech.eu/jobs/delete-' . uniqid());
        $offer->setDescription('Description à supprimer');
        $offer->setCompanyId($company);
        $offer->setSourceId($source);
        $offer->addCategoryId($category);
        $offer->setCity('Lille');
        $offer->setIsRemote(null);
        $offer->setPublishedAt(new \DateTimeImmutable());
        $offer->setStartsAt(new \DateTimeImmutable());
        $offer->setCreatedAt(new \DateTimeImmutable());
        $offer->setUpdatedAt(new \DateTimeImmutable());
        $offer->setIsDuplicate(false);
        $offer->setViewsCount(0);

        $em->persist($offer);
        $em->flush();

        $offerId = $offer->getId();

        $this->client->request('DELETE', '/api/offers/' . $offerId);
        $this->assertResponseStatusCodeSame(204);

        $this->client->request('GET', '/api/offers/' . $offerId);
        $this->assertResponseStatusCodeSame(404);
    }
}
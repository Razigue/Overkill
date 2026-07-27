<?php

namespace App\Tests\Controller;

use App\Entity\Categories;
use App\Entity\Companies;
use App\Entity\Offers;
use App\Entity\Sources;
use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class OffersControllerTest extends WebTestCase
{
    private ?KernelBrowser $client = null;

    protected function setUp(): void
    {
        parent::setUp();
        $this->client = static::createClient();
    }

    /**
     * Helper pour préparer la base de données avec des entités de dépendance (Company, Source, Category)
     */
    private function createDependencies(): array
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();

        $company = new Companies();
        if (method_exists($company, 'setName')) {
            $company->setName('Epitech Corporate');
        }
        $em->persist($company);

        $source = new Sources();
        if (method_exists($source, 'setName')) {
            $source->setName('Internal Portal');
        }
        $em->persist($source);

        $category = new Categories();
        if (method_exists($category, 'setName')) {
            $category->setName('IT / Software');
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
        $this->client->request('GET', '/api/offers?q=Developer&city=Paris&remote=1');

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
            'kind' => 'Job',
            'description' => 'Un super poste de dev Symfony.',
            'company_id' => $company->getId(),
            'source_id' => $source->getId(),
            'category_id' => [$category->getId()],
            'city' => 'Paris',
            'country' => 'France',
            'isRemote' => true,
            'salaryMin' => 45000,
            'salaryMax' => 55000,
            'salaryCurrency' => 'EUR',
            'contract' => 'CDI',
            'extractedSkills' => ['PHP 8', 'Symfony 7', 'PostgreSQL'],
            'externalUrl' => 'https://epitech.eu/jobs/1',
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
        $this->assertArrayHasKey('id', $responseData);
        $this->assertSame('Développeur PHP / Symfony', $responseData['title']);
    }

    public function testPostOfferCompanyNotFound(): void
    {
        [$company, $source, $category] = $this->createDependencies();

        $payload = [
            'title' => 'Poste sans entreprise valide',
            'kind' => 'Job',
            'description' => 'Description',
            'company_id' => 999999, // ID inexistant
            'source_id' => $source->getId(),
            'category_id' => [$category->getId()],
            'city' => 'Paris',
            'country' => 'France',
            'isRemote' => false,
            'salaryMin' => 30000,
            'salaryMax' => null,
            'salaryCurrency' => 'EUR',
            'contract' => 'CDI',
            'extractedSkills' => [],
            'externalUrl' => 'https://epitech.eu/jobs/invalid',
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
        $offer->setKind('Job');
        $offer->setDescription('Description test');
        $offer->setCompanyId($company);
        $offer->setSourceId($source);
        $offer->addCategoryId($category);
        $offer->setCity('Lyon');
        $offer->setCountry('France');
        $offer->setIsRemote(false);
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
        $this->assertSame('Offre de test ID', $responseData['title']);
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
        $offer->setKind('Job');
        $offer->setDescription('Description à supprimer');
        $offer->setCompanyId($company);
        $offer->setSourceId($source);
        $offer->addCategoryId($category);
        $offer->setCity('Lille');
        $offer->setCountry('France');
        $offer->setIsRemote(false);
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

        // Vérification que l'offre n'existe plus
        $this->client->request('GET', '/api/offers/' . $offerId);
        $this->assertResponseStatusCodeSame(404);
    }
}
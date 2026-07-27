<?php

namespace App\Tests\Controller;

use App\Entity\Categories;
use App\Entity\Companies;
use App\Entity\Offers;
use App\Entity\Sources;
use App\Entity\User;
use App\Entity\UserFavorites;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class UserFavoriteControllerTest extends WebTestCase
{
    private ?KernelBrowser $client = null;
    private ?User $testUser = null;

    protected function setUp(): void
    {
        parent::setUp();
        $this->client = static::createClient();

        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();

        // 1. Création d'un utilisateur de test unique
        $this->testUser = new User();
        $this->testUser->setEmail('test_fav_' . uniqid() . '@example.com');
        $this->testUser->setPassword('password123');

        if (method_exists($this->testUser, 'setFirstName')) {
            $this->testUser->setFirstName('Fav');
        }
        if (method_exists($this->testUser, 'setLastName')) {
            $this->testUser->setLastName('User');
        }
        if (method_exists($this->testUser, 'setRoles')) {
            $this->testUser->setRoles(['ROLE_USER']);
        }

        $em->persist($this->testUser);
        $em->flush();

        // 2. Génération et configuration du token JWT global
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

    private function createOfferDependency(): Offers
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $uniq = uniqid();

        $company = new Companies();
        if (method_exists($company, 'setName')) {
            $company->setName('Fav Corp ' . $uniq);
        }
        $em->persist($company);

        $source = new Sources();
        if (method_exists($source, 'setName')) {
            $source->setName('Fav Source ' . $uniq);
        }
        if (method_exists($source, 'setBaseUrl')) {
            $source->setBaseUrl('https://example-' . $uniq . '.com');
        }
        if (method_exists($source, 'setCode')) {
            $source->setCode('FAV_' . strtoupper($uniq));
        }
        $em->persist($source);

        $category = new Categories();
        if (method_exists($category, 'setName')) {
            $category->setName('Fav Cat ' . $uniq);
        }
        $em->persist($category);

        $offer = new Offers();
        $offer->setTitle('Offre test favori');
        $offer->setKind('job');
        $offer->setContract('CDI');
        $offer->setExtractedSkills(['PHP']);
        $offer->setExternalUrl('https://epitech.eu/jobs/fav-' . $uniq);
        $offer->setDescription('Description favori');
        $offer->setCompanyId($company);
        $offer->setSourceId($source);
        $offer->addCategoryId($category);
        $offer->setCity('Paris');
        $offer->setCountry('FR');
        $offer->setPublishedAt(new \DateTimeImmutable());
        $offer->setStartsAt(new \DateTimeImmutable());
        $offer->setCreatedAt(new \DateTimeImmutable());
        $offer->setUpdatedAt(new \DateTimeImmutable());

        $em->persist($offer);
        $em->flush();

        return $offer;
    }

    // ==========================================
    // 1. TESTS GET /api/userfav
    // ==========================================

    public function testGetUserFavoritesList(): void
    {
        $this->client->request('GET', '/api/userfav');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');
        
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($responseData);
    }

    // ==========================================
    // 2. TESTS POST /api/userfav
    // ==========================================

    public function testPostUserFavoriteSuccess(): void
    {
        $offer = $this->createOfferDependency();

        $payload = ['offer_id' => $offer->getId()];

        $this->client->request(
            'POST',
            '/api/userfav',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        $this->assertResponseStatusCodeSame(201);
    }

    public function testPostUserFavoriteOfferNotFound(): void
    {
        $payload = ['offer_id' => 999999];

        $this->client->request(
            'POST',
            '/api/userfav',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        $this->assertResponseStatusCodeSame(404);
    }

    public function testPostUserFavoriteAlreadyExists(): void
    {
        $offer = $this->createOfferDependency();
        $em = static::getContainer()->get('doctrine')->getManager();

        // Ajout direct en favori
        $fav = new UserFavorites();
        $fav->setOfferId($offer);
        $fav->setUserId($this->testUser);
        $fav->setCreatedAt(new \DateTimeImmutable());
        $em->persist($fav);
        $em->flush();

        $payload = ['offer_id' => $offer->getId()];

        $this->client->request(
            'POST',
            '/api/userfav',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        $this->assertResponseStatusCodeSame(409);
    }

    // ==========================================
    // 3. TESTS DELETE /api/userfav/{id}
    // ==========================================

    public function testDeleteUserFavoriteSuccess(): void
    {
        $offer = $this->createOfferDependency();
        $em = static::getContainer()->get('doctrine')->getManager();

        $fav = new UserFavorites();
        $fav->setOfferId($offer);
        $fav->setUserId($this->testUser);
        $fav->setCreatedAt(new \DateTimeImmutable());
        $em->persist($fav);
        $em->flush();

        $favId = $fav->getId();

        $this->client->request('DELETE', '/api/userfav/' . $favId);

        $this->assertResponseStatusCodeSame(204);
    }

    public function testDeleteUserFavoriteNotFound(): void
    {
        $this->client->request('DELETE', '/api/userfav/999999');

        $this->assertResponseStatusCodeSame(404);
    }
}
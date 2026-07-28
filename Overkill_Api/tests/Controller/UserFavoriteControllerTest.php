<?php

namespace App\Tests\Controller;

use App\Entity\Company;
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

        // Nettoyage de la base de données dans l'ordre pour respecter les contraintes de clés étrangères
        $this->entityManager->createQuery('DELETE FROM App\Entity\UserFavorites')->execute();
        $this->entityManager->createQuery('DELETE FROM App\Entity\Offers')->execute();

        if (class_exists('App\Entity\Company')) {
            $this->entityManager->createQuery('DELETE FROM App\Entity\Company')->execute();
        }

        $this->entityManager->createQuery('DELETE FROM App\Entity\User')->execute();

        // 1. Création de l'utilisateur de test
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

        // 2. Création de l'entreprise (requise par la relation ManyToOne non nulle sur Offers)
        $companyEntity = null;
        if (class_exists('App\Entity\Company')) {
            $companyEntity = new Company();
            if (method_exists($companyEntity, 'setName')) {
                $companyEntity->setName('Test Company');
            }
            if (method_exists($companyEntity, 'setExternalId')) {
                $companyEntity->setExternalId('COMP-12345');
            }
            $this->entityManager->persist($companyEntity);
        }

        // 3. Création de l'offre de test
        $this->offer = new Offers();

        // Association de la relation Company
        if ($companyEntity !== null) {
            if (method_exists($this->offer, 'setCompanyId')) {
                $this->offer->setCompanyId($companyEntity);
            } elseif (method_exists($this->offer, 'setCompany')) {
                $this->offer->setCompany($companyEntity);
            }
        }

        // Champs booléens
        if (method_exists($this->offer, 'setIsDuplicate')) {
            $this->offer->setIsDuplicate(false);
        } elseif (method_exists($this->offer, 'setDuplicate')) {
            $this->offer->setDuplicate(false);
        }

        // Champs numériques (compteurs & salaires)
        if (method_exists($this->offer, 'setViewsCount')) {
            $this->offer->setViewsCount(0);
        } elseif (method_exists($this->offer, 'setViews')) {
            $this->offer->setViews(0);
        }

        if (method_exists($this->offer, 'setSalary')) {
            $this->offer->setSalary(45000);
        }

        // Champs textes de base
        if (method_exists($this->offer, 'setTitle')) {
            $this->offer->setTitle('Test Job Offer');
        }
        if (method_exists($this->offer, 'setDescription')) {
            $this->offer->setDescription('Test Description');
        }
        if (method_exists($this->offer, 'setKind')) {
            $this->offer->setKind('job');
        }
        if (method_exists($this->offer, 'setContract')) {
            $this->offer->setContract('CDI');
        }
        if (method_exists($this->offer, 'setLocation')) {
            $this->offer->setLocation('Paris');
        }

        // Au cas où 'company' est une simple chaîne de caractères en plus de l'entité
        if (method_exists($this->offer, 'setCompany') && $companyEntity === null) {
            $this->offer->setCompany('Test Company Name');
        }

        // Champs externes & identifiants
        if (method_exists($this->offer, 'setExternalUrl')) {
            $this->offer->setExternalUrl('https://example.com/job/123');
        }
        if (method_exists($this->offer, 'setExternalId')) {
            $this->offer->setExternalId('EXT-12345');
        }
        if (method_exists($this->offer, 'setSource')) {
            $this->offer->setSource('Indeed');
        }
        if (method_exists($this->offer, 'setUrl')) {
            $this->offer->setUrl('https://example.com/job/123');
        }

        // Champs de type Array / JSON
        if (method_exists($this->offer, 'setExtractedSkills')) {
            $this->offer->setExtractedSkills(['PHP', 'Symfony']);
        }
        if (method_exists($this->offer, 'setSkills')) {
            $this->offer->setSkills(['PHP', 'Symfony']);
        }

        // Champs de type DateTime
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
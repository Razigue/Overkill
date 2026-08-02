<?php

namespace App\Tests\Controller;

use App\Entity\Skill;
use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class UserSkillControllerTest extends WebTestCase
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
        $this->testUser->setEmail('test_skills_' . uniqid() . '@example.com');
        $this->testUser->setPassword('password123');

        if (method_exists($this->testUser, 'setFirstName')) {
            $this->testUser->setFirstName('Skill');
        }
        if (method_exists($this->testUser, 'setLastName')) {
            $this->testUser->setLastName('Tester');
        }
        if (method_exists($this->testUser, 'setRoles')) {
            $this->testUser->setRoles(['ROLE_USER']);
        }

        $em->persist($this->testUser);
        $em->flush();

        // 2. Génération du token JWT et injection dans les en-têtes HTTP du client
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

    // ==========================================
    // 1. TESTS GET /api/user/skills
    // ==========================================

    public function testListSkills(): void
    {
        $this->client->request('GET', '/api/user/skills');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');

        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($responseData);
    }

    // ==========================================
    // 2. TESTS POST /api/user/skills
    // ==========================================

    public function testAddSkillSuccess(): void
    {
        $payload = [
            'name' => 'Symfony 7 - ' . uniqid(),
        ];

        $this->client->request(
            'POST',
            '/api/user/skills',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        $this->assertResponseStatusCodeSame(201);
        
        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertSame('Compétence ajoutée avec succès', $responseData['message'] ?? null);
        $this->assertArrayHasKey('skill', $responseData);
        $this->assertSame($payload['name'], $responseData['skill']['name'] ?? null);
    }

    public function testAddSkillEmptyNameValidation(): void
    {
        $payload = [
            'name' => '   ',
        ];

        $this->client->request(
            'POST',
            '/api/user/skills',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        $this->assertResponseStatusCodeSame(400);

        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertSame('Le nom de la compétence est requis.', $responseData['error'] ?? null);
    }

    public function testAddExistingSkillReusesEntity(): void
    {
        $em = static::getContainer()->get('doctrine')->getManager();
        $skillName = 'PHP 8_' . uniqid();

        // Pré-création de la compétence globale en BDD
        $existingSkill = new Skill();
        $existingSkill->setName($skillName);
        $em->persist($existingSkill);
        $em->flush();

        $payload = ['name' => $skillName];

        $this->client->request(
            'POST',
            '/api/user/skills',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        $this->assertResponseStatusCodeSame(201);

        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertSame($existingSkill->getId(), $responseData['skill']['id'] ?? null);
    }

    // ==========================================
    // 3. TESTS DELETE /api/user/skills/{id}
    // ==========================================

    public function testRemoveSkillSuccess(): void
    {
        $em = static::getContainer()->get('doctrine')->getManager();

        // 1. Création et association de la compétence à l'utilisateur
        $skill = new Skill();
        $skill->setName('Docker_' . uniqid());
        $em->persist($skill);

        $this->testUser->addSkill($skill);
        $em->flush();

        $skillId = $skill->getId();

        // 2. Appel de la suppression
        $this->client->request('DELETE', '/api/user/skills/' . $skillId);

        $this->assertResponseIsSuccessful();

        $responseData = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertSame('Compétence supprimée avec succès', $responseData['message'] ?? null);
    }

    public function testRemoveSkillNotFound(): void
    {
        $this->client->request('DELETE', '/api/user/skills/999999');

        $this->assertResponseStatusCodeSame(404);
    }
}
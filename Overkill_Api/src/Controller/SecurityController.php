<?php

/**
 * This controller handles authentication and user management endpoints
 * like registration and login for the React Frontend.
 */

namespace App\Controller;

use App\Entity\User;
use Symfony\Component\Routing\Attribute\Route;
use App\Dto\RegistrationInput;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

final class SecurityController extends AbstractController
{

#[Route('/api/check/database', methods:['POST'], name:'api_check_database')]
public function database(EntityManagerInterface $em): Response
{
    try {
        // ->connect() now is protected thus deprecated
        // ->isConnected() as no transaction response is null
        // Otherwise throws exception
        $connected = ! $em->getConnection()->isConnected();
        return $this->json([
            'status' => $em->getConnection()->isConnected(),
            'message' => $connected ? 'connected.' : 'failed.'
        ]);

    } catch (\Exception $e) {
        return $this->json([
            'status'  => false,
            'message' => 'Connect to database failed - Check connection params.',
            'error'   => $e->getMessage()
        ]);
    }
}


    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        #[MapRequestPayload] RegistrationInput $input, // DTO
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository
    ): JsonResponse {
        $existingUser = $userRepository->findOneBy(['email' => $input->email]);

        if ($existingUser) {
            return $this->json(
                ['error' => 'Un compte existe déjà avec cette adresse mail.'],
                Response::HTTP_CONFLICT
            );
        }

        $user = new User();
        $user->setEmail($input->email);
        $user->setFirstName($input->firstName);
        $user->setLastName($input->lastName);
        $user->setRoles(['ROLE_USER']);

        $hashedPassword = $passwordHasher->hashPassword($user, $input->password);
        $user->setPassword($hashedPassword);

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json([
            'message' => 'Utilisateur inscrit avec succès !',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstname' => $user->getFirstName(),
                'lastname' => $user->getLastName(),
            ]
        ], Response::HTTP_CREATED);
    }
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(#[CurrentUser] ?User $user): JsonResponse {
        if ($user === null) {
            return $this->json(
                ['error' => 'Les champs sont invalides'],
                Response::HTTP_UNAUTHORIZED
            );
        }
        return $this->json([
            'message' => 'Utilisateur connecté avec succès !',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstname' => $user->getFirstName(),
                'lastname' => $user->getLastName(),
            ]
        ], Response::HTTP_OK);
    }

    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function me(#[CurrentUser] ?User $user): JsonResponse {
        if ($user === null) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'firstname' => $user->getFirstName(),
            'lastname' => $user->getLastName(),
        ]);
    }
}

<?php

/**
 * This controller handles authentication and user management endpoints
 * like registration and login for the React Frontend.
 */

namespace App\Controller;

use App\Entity\User;
use App\Dto\ChangePasswordInput;
use App\Dto\UpdateProfileInput;
use Symfony\Component\Routing\Attribute\Route;
use App\Dto\RegistrationInput;
use App\Repository\UserRepository;
use App\Repository\UserFavoritesRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\HeaderUtils;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;
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
            'dataDeletionRequestedAt' => $user->getDataDeletionRequestedAt()?->format(\DateTimeInterface::ATOM),
        ]);
    }

    #[Route('/api/me/password', name: 'api_change_password', methods: ['PATCH'])]
    public function changePassword(
        #[CurrentUser] ?User $user,
        #[MapRequestPayload] ChangePasswordInput $input,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        if ($user === null) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        if (!$passwordHasher->isPasswordValid($user, $input->currentPassword)) {
            return $this->json(
                ['error' => 'Le mot de passe actuel est incorrect.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        if ($passwordHasher->isPasswordValid($user, $input->newPassword)) {
            return $this->json(
                ['error' => 'Le nouveau mot de passe doit être différent du mot de passe actuel.'],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $user->setPassword($passwordHasher->hashPassword($user, $input->newPassword));
        $user->setUpdatedAt(new \DateTimeImmutable());
        $entityManager->flush();

        return $this->json(['message' => 'Votre mot de passe a bien été modifié.']);
    }

    #[Route('/api/me/profile', name: 'api_update_profile', methods: ['PATCH'])]
    public function updateProfile(
        #[CurrentUser] ?User $user,
        #[MapRequestPayload] UpdateProfileInput $input,
        UserPasswordHasherInterface $passwordHasher,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        if ($user === null) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        if (!$passwordHasher->isPasswordValid($user, $input->currentPassword)) {
            return $this->json(
                ['error' => 'Le mot de passe actuel est incorrect.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        $email = mb_strtolower(trim($input->email));
        $existingUser = $userRepository->findOneBy(['email' => $email]);
        if ($existingUser !== null && $existingUser->getId() !== $user->getId()) {
            return $this->json(
                ['error' => 'Un compte existe déjà avec cette adresse e-mail.'],
                Response::HTTP_CONFLICT
            );
        }

        $emailChanged = $email !== $user->getEmail();
        $user->setFirstName(trim($input->firstName));
        $user->setLastName(trim($input->lastName));
        $user->setEmail($email);
        $user->setUpdatedAt(new \DateTimeImmutable());
        $entityManager->flush();

        return $this->json([
            'message' => $emailChanged
                ? 'Vos informations ont été modifiées. Reconnectez-vous avec votre nouvelle adresse e-mail.'
                : 'Vos informations personnelles ont bien été modifiées.',
            'requiresReauthentication' => $emailChanged,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstname' => $user->getFirstName(),
                'lastname' => $user->getLastName(),
                'dataDeletionRequestedAt' => $user->getDataDeletionRequestedAt()?->format(\DateTimeInterface::ATOM),
            ],
        ]);
    }

    #[Route('/api/me/sessions/revoke', name: 'api_revoke_all_sessions', methods: ['POST'])]
    public function revokeAllSessions(
        #[CurrentUser] ?User $user,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        if ($user === null) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $user->revokeAllSessions();
        $user->setUpdatedAt(new \DateTimeImmutable());
        $entityManager->flush();

        return $this->json(['message' => 'Tous vos appareils ont été déconnectés.']);
    }

    #[Route('/api/me/data-export', name: 'api_export_personal_data', methods: ['GET'])]
    public function exportPersonalData(
        #[CurrentUser] ?User $user,
        UserFavoritesRepository $favoritesRepository
    ): JsonResponse {
        if ($user === null) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $skills = [];
        foreach ($user->getSkills() as $skill) {
            $skills[] = [
                'id' => $skill->getId(),
                'name' => $skill->getName(),
            ];
        }

        $cvs = [];
        foreach ($user->getCvs() as $cv) {
            $cvs[] = [
                'id' => $cv->getId(),
                'originalName' => $cv->getOriginalName(),
                'filePath' => $cv->getFilePath(),
                'uploadedAt' => $cv->getUploadedAt()?->format(\DateTimeInterface::ATOM),
            ];
        }

        $favorites = [];
        foreach ($favoritesRepository->findBy(['user_id' => $user]) as $favorite) {
            $offer = $favorite->getOfferId();
            $favorites[] = [
                'id' => $favorite->getId(),
                'createdAt' => $favorite->getCreatedAt()?->format(\DateTimeInterface::ATOM),
                'offer' => $offer === null ? null : [
                    'id' => $offer->getId(),
                    'title' => $offer->getTitle(),
                    'company' => $offer->getCompany(),
                    'externalUrl' => $offer->getExternalUrl(),
                ],
            ];
        }

        $response = $this->json([
            'generatedAt' => (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM),
            'account' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstname' => $user->getFirstName(),
                'lastname' => $user->getLastName(),
                'roles' => $user->getRoles(),
                'createdAt' => $user->getCreatedAt()?->format(\DateTimeInterface::ATOM),
                'updatedAt' => $user->getUpdatedAt()?->format(\DateTimeInterface::ATOM),
            ],
            'profile' => [
                'cvText' => $user->getCvText(),
                'skills' => $skills,
            ],
            'documents' => $cvs,
            'favoriteOffers' => $favorites,
            'dataDeletionRequest' => [
                'requestedAt' => $user->getDataDeletionRequestedAt()?->format(\DateTimeInterface::ATOM),
            ],
        ]);
        $filename = sprintf('overkill-donnees-personnelles-%s.json', (new \DateTimeImmutable())->format('Y-m-d'));
        $response->headers->set(
            'Content-Disposition',
            HeaderUtils::makeDisposition(HeaderUtils::DISPOSITION_ATTACHMENT, $filename)
        );

        return $response;
    }

    #[Route('/api/me/data-deletion-request', name: 'api_request_data_deletion', methods: ['POST'])]
    public function requestDataDeletion(
        #[CurrentUser] ?User $user,
        EntityManagerInterface $entityManager,
        UserFavoritesRepository $favoritesRepository,
        MailerInterface $mailer,
        #[Autowire('%env(CONTACT_RECIPIENT)%')] string $recipient,
        #[Autowire('%env(CONTACT_SENDER)%')] string $sender
    ): JsonResponse {
        if ($user === null) {
            return $this->json(['error' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $userId = $user->getId();
        $userEmail = (string) $user->getEmail();
        $fullName = trim(sprintf('%s %s', $user->getFirstName(), $user->getLastName()));
        $email = (new Email())
            ->from(new Address($sender, 'Overkill'))
            ->to(new Address($userEmail, $fullName ?: $userEmail))
            ->bcc($recipient)
            ->subject('[Overkill] Votre compte a été supprimé')
            ->text(sprintf(
                "Bonjour %s,\n\nVotre compte Overkill et les données personnelles qui lui sont associées ont été supprimés. Vous ne pouvez désormais plus vous connecter avec l’adresse %s.\n\nIdentifiant de l’ancien compte : %d\nDate de suppression : %s\n\nL’équipe Overkill",
                $fullName ?: 'Non renseigné',
                $userEmail,
                $userId,
                (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM),
            ));

        try {
            $mailer->send($email);
        } catch (TransportExceptionInterface) {
            return $this->json(
                ['error' => 'Le compte n’a pas été supprimé car l’e-mail de confirmation n’a pas pu être envoyé. Réessayez dans quelques instants.'],
                Response::HTTP_SERVICE_UNAVAILABLE
            );
        }

        foreach ($favoritesRepository->findBy(['user_id' => $user]) as $favorite) {
            $entityManager->remove($favorite);
        }

        $entityManager->remove($user);
        $entityManager->flush();

        return $this->json([
            'message' => 'Votre compte et vos données personnelles ont été supprimés. Un e-mail de confirmation vous a été envoyé.',
        ]);
    }
}

<?php

namespace App\Controller;

use App\Entity\Application;
use App\Entity\User;
use App\Repository\ApplicationRepository;
use App\Repository\OffersRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/applications')]
#[IsGranted('ROLE_USER')]
final class ApplicationController extends AbstractController
{
    #[Route('', name: 'api_applications_index', methods: ['GET'])]
    public function index(#[CurrentUser] User $user, ApplicationRepository $applications): JsonResponse
    {
        return $this->json(
            $applications->findBy(['user' => $user], ['createdAt' => 'DESC']),
            Response::HTTP_OK,
            [],
            ['groups' => ['application:read', 'offers:read']]
        );
    }

    #[Route('', name: 'api_applications_create', methods: ['POST'])]
    public function create(
        #[CurrentUser] User $user,
        Request $request,
        OffersRepository $offers,
        ApplicationRepository $applications,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $offerId = $request->toArray()['offer_id'] ?? null;

        if (!is_int($offerId) && !(is_string($offerId) && ctype_digit($offerId))) {
            return $this->json(['error' => 'Un identifiant d’offre valide est obligatoire.'], Response::HTTP_BAD_REQUEST);
        }

        $offer = $offers->find((int) $offerId);
        if ($offer === null) {
            return $this->json(['error' => 'Cette offre est introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $existingApplication = $applications->findOneBy(['user' => $user, 'offer' => $offer]);
        if ($existingApplication !== null) {
            return $this->json(
                ['message' => 'Cette candidature est déjà enregistrée.', 'application' => $existingApplication],
                Response::HTTP_CONFLICT,
                [],
                ['groups' => ['application:read', 'offers:read']]
            );
        }

        $application = (new Application())->setUser($user)->setOffer($offer);
        $entityManager->persist($application);
        $entityManager->flush();

        return $this->json(
            $application,
            Response::HTTP_CREATED,
            [],
            ['groups' => ['application:read', 'offers:read']]
        );
    }

    #[Route('/{id}', name: 'api_applications_delete', methods: ['DELETE'], requirements: ['id' => '\\d+'])]
    public function delete(
        #[CurrentUser] User $user,
        int $id,
        ApplicationRepository $applications,
        EntityManagerInterface $entityManager
    ): Response {
        $application = $applications->find($id);
        if ($application === null) {
            return $this->json(['error' => 'Cette candidature est introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if ($application->getUser() !== $user) {
            return $this->json(['error' => 'Vous ne pouvez pas retirer cette candidature.'], Response::HTTP_FORBIDDEN);
        }

        $entityManager->remove($application);
        $entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }
}

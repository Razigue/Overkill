<?php

namespace App\Controller;

use App\Repository\OffersRepository;
use App\Entity\User;
use App\Entity\UserFavorites;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Repository\UserRepository;
use App\Repository\UserFavoritesRepository;
use DateTimeImmutable;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

#[IsGranted('ROLE_USER')]
final class UserFavoriteController extends AbstractController
{
    #[Route('/api/userfav', name: 'userfav', methods: ['GET'])]
    public function getUserFav(#[CurrentUser] ?User $user, UserFavoritesRepository $userFav)
    {
        $existingUserFav = $userFav->findBy(['user_id' => $user]);
        return $this->json(
            $existingUserFav,
            Response::HTTP_OK,
            [],
            ['groups' => ['favorites:read', 'offers:read']]
        );
    }


    #[Route('/api/userfav', name: 'postuserfav', methods: ['POST'])]
    public function postUserFav(#[CurrentUser] ?User $user, Request $request, OffersRepository $offers, EntityManagerInterface $entityManager, UserFavoritesRepository $userFav)
    {
        $data = $request->toArray();
        $offer = $offers->find($data['offer_id']);
        if ($offer == null) {
            return $this->json("Aucune offre favorite trouvé", Response::HTTP_NOT_FOUND);
        }

        $existingUserFav = $userFav->findOneBy(['user_id' => $user, 'offer_id' => $offer]);

        if ($existingUserFav !== null) {
            return $this->json("L'offre est déjà en favori", Response::HTTP_CONFLICT);
        }
        $createFavOffer = new UserFavorites();
        $createFavOffer->setOfferId($offer);
        $createFavOffer->setUserId($user);
        $createFavOffer->setCreatedAt(new DateTimeImmutable());
        $entityManager->persist($createFavOffer);
        $entityManager->flush();

        return new Response(null, Response::HTTP_CREATED);
    }

    #[Route('/api/userfav/{id}', name: 'deleteuserfav', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function deleteUserFav(
        #[CurrentUser] User $user,
        UserFavoritesRepository $userFav,
        EntityManagerInterface $entityManager,
        int $id
    ): Response {
        $favorite = $userFav->find($id);

        if ($favorite === null) {
            return $this->json(['error' => 'Aucun favori trouvé'], Response::HTTP_NOT_FOUND);
        }

        if ($favorite->getUserId() !== $user) {
            return $this->json(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $entityManager->remove($favorite);
        $entityManager->flush();

        return new Response(null, Response::HTTP_NO_CONTENT);
    }
}
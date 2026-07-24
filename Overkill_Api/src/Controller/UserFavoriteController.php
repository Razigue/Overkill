
<?php

namespace App\Controller;

use App\Repository\OffersRepository;
use App\Entity\User;
use App\Entity\UserFavorites;
use Symfony\Component\HttpFoundation\Request;
use App\Repository\UserRepository;
use App\Repository\UserFavoritesRepository;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;


final class UserFavoriteController extends AbstractController
{
    #[Route('/api/userfav', name: 'userfav', methods: ['GET'])]
    public function getUserFav(#[CurrentUser] ?User $user, Request $request, UserFavoritesRepository $userFav) {

    }


    #[Route('/api/userfav', name: 'postuserfav', methods: ['POST'])]
    public function postUserFav(#[CurrentUser] ?User $user, Request $request, OffersRepository $offers, EntityManagerInterface $entityManager, UserFavoritesRepository $userFav) {
        $data = $request->toArray();
        $offer = $offers->find($data['offer_id']);
       if ($offer == null) {
        return $this->json("Aucune offre favorite trouvé", Response::HTTP_NOT_FOUND);
    }
      
        $existingUserFav = $userFav->findOneBy(['user_id' => $user, 'offer_id' => $offer]);

        if($existingUserFav !== null) {
            return $this->json("L'offre est déjà en favori", Response::HTTP_CONFLICT);
        }
        $createFavOffer = new UserFavorites();
        $createFavOffer->setOfferId($offer);
        $createFavOffer->setUserId($user);

}



}

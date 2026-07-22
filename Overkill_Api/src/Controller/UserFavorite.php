<?php

namespace App\Controller;

use App\Repository\OffersRepository;
use App\Entity\User;
use Symfony\Component\HttpFoundation\Request;
use App\Repository\UserRepository;
use App\Repository\UserFavoritesRepository;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;


final class UserFavoriteController extends AbstractController
{
    #[Route('/api/userfav', name: 'userfav', methods: ['GET'])]
    public function getUserFav(#[CurrentUser] ?User $user, Request $request, UserFavoritesRepository $userFav) {}


    #[Route('/api/userfav', name: 'postuserfav', methods: ['POST'])]
    public function postUserFav(#[CurrentUser] ?User $user, Request $request, OffersRepository $offers, EntityManagerInterface $entityManager) {}

}

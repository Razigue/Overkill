<?php

namespace App\Controller;

use App\Repository\OffersRepository;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\Attribute\Groups;

final class OffersController extends AbstractController
{
    #[Route('/api/offers', name: 'api_offers', methods: ['GET'])]
    public function getOffer(OffersRepository $offers): JsonResponse
    {
        $existingoffers = $offers->findAll();
        return $this->json($existingoffers, 200, [], ['groups' => 'offers:read']);
    }
}

    #[Route('/api/offers', name: 'api_offers', methods: ['POST'])]
    public function setOffer(OffersRepository $offers): JsonResponse {
        
    }
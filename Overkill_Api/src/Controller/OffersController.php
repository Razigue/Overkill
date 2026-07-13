<?php

namespace App\Controller;


use App\Entity\Offers;
use App\Repository\CompaniesRepository;
use App\Repository\OffersRepository;
use App\Repository\SourcesRepository;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;

final class OffersController extends AbstractController
{
    #[Route('/api/offers', name: 'api_offers', methods: ['GET'])]
    public function getOffer(OffersRepository $offers): JsonResponse {
       $existingoffers = $offers->findAll();
        return $this->json([$existingoffers]);
    }


    #[Route('api/offers/create', name: 'api_offers_create', methods: ['POST'])]
    public function createOffer(OffersRepository $offers, CompaniesRepository $companies, SourcesRepository $sources): JsonResponse {
        $offers = new Offers();
        

    }
}

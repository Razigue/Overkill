<?php

namespace App\Controller;

use App\Dto\OfferInput;
use App\Repository\OffersRepository;
use App\Repository\SourcesRepository;
use App\Repository\CategoriesRepository;
use App\Repository\CompaniesRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\HttpFoundation\Response;

final class OffersController extends AbstractController
{
    #[Route('/api/offers', name: 'api_offers', methods: ['GET'])]
    public function getOffer(OffersRepository $offers): JsonResponse
    {
        $existingOffers = $offers->findAll();
        return $this->json($existingOffers, 200, [], ['groups' => 'offers:read']);
    }
    
    #[Route('/api/offers', name: 'api_create_offers', methods: ['POST'])]
    public function setOffer(
        #[MapRequestPayload]
        OfferInput $input,
        CompaniesRepository $companies,
        CategoriesRepository $categories,
        SourcesRepository $sources,
        EntityManagerInterface $entityManager
    ): JsonResponse {


    
        $company = $companies->find($input->company_id);

        if ($company == null) {
            return $this->json("L'id reçu ne correspond à rien",   Response::HTTP_NOT_FOUND);
        }
        
        $source = $sources->find($input->source_id);

        if ($source == null) {
            return $this->json("La source reçu ne correspond à rien",   Response::HTTP_NOT_FOUND);
        }


    }, Response::HTTP_CREATED;

}

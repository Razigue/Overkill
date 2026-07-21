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
use App\Entity\Offers;
use DateTime;
use DateTimeImmutable;

final class OffersController extends AbstractController
{
    #[Route('/api/offers', name: 'api_offers', methods: ['GET'])]
    public function getOffer(OffersRepository $offers): JsonResponse
    {
        $validOffers = [];
        $expiredOffer = (new DateTimeImmutable())->modify('-30 days');
        $existingOffers = $offers->findAll();
        foreach($existingOffers as $offer) {
     
            if ($offer->getPublishedAt() >= $expiredOffer) {
                $validOffers[] = $offer;  
            }
           
        }
        return $this->json($validOffers, 200, [], ['groups' => 'offers:read']);
    }

    #[Route('/api/offers', name: 'api_create_offers', methods: ['POST'])]
    public function postOffer(
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

        $foundCategories = [];
        foreach ($input->category_id as $category_id) {
            $foundCategories[] = $category = $categories->find($category_id);

            if ($category == null) {
                return $this->json("La catégorie ne correspond à rien", Response::HTTP_NOT_FOUND);
            }
        }

        $createOffer = new Offers();
        $createOffer->setTitle($input->title);
        $createOffer->setKind($input->kind);
        $createOffer->setDescription($input->description);
        $createOffer->setCompanyId($company);
        $createOffer->setSourceId($source);

        foreach ($foundCategories as $category_id) {
            $createOffer->addCategoryId($category_id);
        }

        $createOffer->setCity($input->city);
        $createOffer->setCountry($input->country);
        $createOffer->setIsRemote($input->isRemote);
        $createOffer->setSalaryMin($input->salaryMin);
        $createOffer->setSalaryMax($input->salaryMax);
        $createOffer->setSalaryCurrency($input->salaryCurrency);
        $createOffer->setContract($input->contract);
        $createOffer->setExtractedSkills($input->extractedSkills);
        $createOffer->setExternalUrl($input->externalUrl);
        $createOffer->setLatitude($input->latitude === null ? null : (int) $input->latitude);
        $createOffer->setLongitude($input->longitude === null ? null : (int) $input->longitude);
        $createOffer->setPublishedAt(new DateTimeImmutable($input->publishedAt));
        $createOffer->setStartsAt(new DateTime($input->startsAt));
        $createOffer->setEndsAt($input->endsAt === null ? null : new DateTime($input->endsAt));
        $createOffer->setCreatedAt(new DateTimeImmutable());
        $createOffer->setUpdatedAt(new DateTimeImmutable());
        $createOffer->setIsDuplicate(false);
        $createOffer->setViewsCount(0);
        $entityManager->persist($createOffer);
        $entityManager->flush();
        return $this->json(
            $createOffer,
            Response::HTTP_CREATED,
            [],
            ['groups' => 'offers:read']
        );
    }

    #[Route('/api/offers/{id}', name: 'api_offers_id', methods: ['GET'])]
    public function getOfferById(OffersRepository $offers, int $id): JsonResponse
    {
        $existingOffers = $offers->find($id);
        if ($existingOffers === null) {
            return $this->json(
                ['error' => 'Aucune offre trouvé'],
                Response::HTTP_NOT_FOUND
            );
        }

        return $this->json($existingOffers, 200, [], ['groups' => 'offers:read']);
    }
}

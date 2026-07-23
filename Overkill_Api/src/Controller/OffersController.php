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
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use App\Entity\Offers;
use DateTime;
use DateTimeImmutable;

final class OffersController extends AbstractController
{
    #[Route('/api/offers', name: 'api_offers', methods: ['GET'])]
    public function getOffer(Request $request, OffersRepository $offers): JsonResponse
    {
        $filters = [
            'q'         => $request->query->get('q'),
            'city'      => $request->query->get('city'),
            'country'   => $request->query->get('country'),
            'company'   => $request->query->get('company'),
            'contract'  => $request->query->get('contract'),
            'kind'      => $request->query->get('kind'),
            'remote'    => $request->query->get('remote'),
            'salaryMin' => $request->query->get('salaryMin'),
            'category'  => $request->query->get('category'),
        ];

        $validOffers = $offers->search($filters);

        return $this->json($validOffers, Response::HTTP_OK, [], ['groups' => 'offers:read']);
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
            return $this->json("L'id reçu ne correspond à rien", Response::HTTP_NOT_FOUND);
        }

        $source = $sources->find($input->source_id);

        if ($source == null) {
            return $this->json("La source reçu ne correspond à rien", Response::HTTP_NOT_FOUND);
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

        $createOffer->setLatitude($input->latitude);
        $createOffer->setLongitude($input->longitude);
        $createOffer->setPublishedAt(new DateTimeImmutable($input->publishedAt));
        $createOffer->setStartsAt(new DateTimeImmutable($input->startsAt));
        $createOffer->setEndsAt($input->endsAt === null ? null : new DateTimeImmutable($input->endsAt));
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
        $existingOffer = $offers->find($id);

        if ($existingOffer === null) {
            return $this->json(
                ['error' => 'Aucune offre trouvee'],
                Response::HTTP_NOT_FOUND
            );
        }

        return $this->json($existingOffer, Response::HTTP_OK, [], ['groups' => 'offers:read']);
    }

    #[Route('/api/offers/{id}', name: 'api_delete_offers', methods: ['DELETE'])]
    public function deleteOffer(
        OffersRepository $offers,
        EntityManagerInterface $entityManager,
        int $id
    ): Response {
        $offer = $offers->find($id);


        if ($offer === null) {
            return $this->json(
                ['error' => 'Aucune offre trouvee'],
                Response::HTTP_NOT_FOUND
            );
        }

        $entityManager->remove($offer);
        $entityManager->flush();


        return new Response(null, Response::HTTP_NO_CONTENT);
    }
}

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
use DateTimeImmutable;

final class OffersController extends AbstractController
{
    #[Route('/api/offers', name: 'api_offers', methods: ['GET'])]
    public function getOffer(Request $request, OffersRepository $offers): JsonResponse
    {
        $filters = [
            'q'         => $request->query->get('q'),
            'city'      => $request->query->get('city'),
            'company'   => $request->query->get('company'),
            'contract'  => $request->query->get('contract'),
            'kind'      => $request->query->get('kind'),
            'remote'    => $request->query->get('remote'),
            'salaryMin' => $request->query->get('salaryMin'),
            'category'  => $request->query->get('category'),
        ];

        $page = max(1, $request->query->getInt('page', 1));

        $paginator = $offers->search($filters, $page);
        $total = count($paginator);

        return $this->json(
            [
                'items'      => iterator_to_array($paginator),
                'pagination' => [
                    'page'       => $page,
                    'total'      => $total,
                    'totalPages' => (int) ceil($total / 10),
                ],
            ],
            Response::HTTP_OK,
            [],
            ['groups' => 'offers:read']
        );
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

        $externalUrl = rtrim(trim($input->externalUrl), '/');
        $connection = $entityManager->getConnection();

        [$offer, $status] = $connection->transactional(function () use (
            $entityManager,
            $source,
            $company,
            $foundCategories,
            $input,
            $externalUrl
        ): array {
            // Serialize concurrent imports of the same source offer. The
            // UNIQUE constraint remains the final safety net.
            $entityManager->getConnection()->executeQuery(
                'SELECT pg_advisory_xact_lock(hashtextextended(:dedupeKey, 0))',
                ['dedupeKey' => $source->getId() . ':' . $externalUrl]
            );

            $offer = $entityManager->getRepository(Offers::class)->findOneBy([
                'source_id' => $source,
                'external_url' => $externalUrl,
            ]);
            $status = $offer === null ? Response::HTTP_CREATED : Response::HTTP_OK;
            $offer ??= new Offers();

            $offer->setTitle($input->title);
            $offer->setKind($input->kind);
            $offer->setDescription($input->description);
            $offer->setCompanyId($company);
            $offer->setSourceId($source);

            foreach ($offer->getCategoryId()->toArray() as $category) {
                $offer->removeCategoryId($category);
            }
            foreach ($foundCategories as $category) {
                $offer->addCategoryId($category);
            }

            $offer->setCity($input->city);
            $offer->setCompany($input->company);
            $offer->setIsRemote($input->isRemote === null ? null : json_encode($input->isRemote, JSON_THROW_ON_ERROR));
            $offer->setSalaryMin($input->salaryMin);
            $offer->setSalaryMax($input->salaryMax);
            $offer->setSalaryCurrency($input->salaryCurrency);
            $offer->setContract($input->contract);
            $offer->setExtractedSkills($input->extractedSkills);
            $offer->setExternalUrl($externalUrl);
            $offer->setLatitude($input->latitude);
            $offer->setLongitude($input->longitude);
            $offer->setPublishedAt(new DateTimeImmutable($input->publishedAt));
            $offer->setStartsAt(new DateTimeImmutable($input->startsAt));
            $offer->setEndsAt($input->endsAt === null ? null : new DateTimeImmutable($input->endsAt));
            $offer->setUpdatedAt(new DateTimeImmutable());
            $offer->setIsDuplicate(false);

            if ($status === Response::HTTP_CREATED) {
                $offer->setCreatedAt(new DateTimeImmutable());
                $offer->setViewsCount(0);
                $entityManager->persist($offer);
            }

            $entityManager->flush();

            return [$offer, $status];
        });

        return $this->json(
            $offer,
            $status,
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

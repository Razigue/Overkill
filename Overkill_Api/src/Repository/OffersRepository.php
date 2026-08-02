<?php

namespace App\Repository;

use App\Entity\Offers;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * @extends ServiceEntityRepository<Offers>
 */
class OffersRepository extends ServiceEntityRepository
{


    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Offers::class);
    }

    public function search(array $filters, int $page = 1): Paginator
    {
        $qb = $this->createQueryBuilder('o')

            ->leftJoin('o.company_id', 'c')
            ->andWhere('o.published_at >= :expiry')
            ->setParameter('expiry', new \DateTimeImmutable('-30 days'))
            ->distinct()
            ->orderBy('o.published_at', 'DESC');


        if (!empty($filters['q'])) {
            $qb->andWhere('LOWER(o.title) LIKE :q OR LOWER(o.description) LIKE :q')
                ->setParameter('q', '%' . mb_strtolower($filters['q']) . '%');
        }

        if (!empty($filters['city'])) {
            $qb->andWhere('LOWER(o.city) LIKE :city')
                ->setParameter('city', '%' . mb_strtolower(trim($filters['city'])) . '%');
        }

        if (!empty($filters['country'])) {
            $qb->andWhere('o.country = :country')
                ->setParameter('country', strtoupper($filters['country']));
        }


        if (!empty($filters['company'])) {
            $qb->andWhere('LOWER(c.name) LIKE :company')
                ->setParameter('company', '%' . mb_strtolower($filters['company']) . '%');
        }

        if (!empty($filters['contract'])) {
            $qb->andWhere('LOWER(o.contract) = :contract')
                ->setParameter('contract', mb_strtolower($filters['contract']));
        }

        if (!empty($filters['kind'])) {
            match (mb_strtolower($filters['kind'])) {
                'job' => $qb->andWhere('LOWER(o.contract) NOT IN (:trainingContracts)')
                    ->setParameter('trainingContracts', ['stage', 'internship', 'alternance', 'apprentissage', 'apprenticeship']),
                'internship' => $qb->andWhere('LOWER(o.contract) IN (:internshipContracts)')
                    ->setParameter('internshipContracts', ['stage', 'internship']),
                'apprenticeship' => $qb->andWhere('LOWER(o.contract) IN (:apprenticeshipContracts)')
                    ->setParameter('apprenticeshipContracts', ['alternance', 'apprentissage', 'apprenticeship']),
                default => $qb->andWhere('1 = 0'),
            };
        }

        if (!empty($filters['remote'])) {
            $remoteValue = match (mb_strtolower($filters['remote'])) {
                'full' => 'fulltime',
                'office' => 'no',
                'hybrid' => 'hybrid',
                default => null,
            };

            if ($remoteValue === null) {
                $qb->andWhere('1 = 0');
            } else {
                $qb->andWhere('LOWER(o.is_remote) = :remote')
                    ->setParameter('remote', $remoteValue);
            }
        }

        if (!empty($filters['salaryMin'])) {
            $salaryMin = (int) $filters['salaryMin'];
            $normalizedSalaryMin = $salaryMin >= 1000
                ? (int) round($salaryMin / 1000)
                : $salaryMin;

            $qb->andWhere('COALESCE(o.salary_max, o.salary_min) >= :salaryMin')
                ->setParameter('salaryMin', $normalizedSalaryMin);
        }


        if (!empty($filters['category'])) {
            $categoryPatterns = match (mb_strtolower($filters['category'])) {
                'développement' => ['%developer%', '%tech lead%', '%blockchain%', '%nocode%'],
                'data' => ['%data%'],
                'design' => ['%design%', '%ux%', '%ui%'],
                'infrastructure' => ['%cloud%', '%devops%', '%system administrator%'],
                'produit' => ['%product owner%', '%project manager%', '%projet owner%', '%scrum master%'],
                default => [],
            };

            if ($categoryPatterns === []) {
                $qb->andWhere('1 = 0');
            } else {
                $categoryExpression = $qb->expr()->orX();
                foreach ($categoryPatterns as $index => $pattern) {
                    $parameterName = 'category_' . $index;
                    $categoryExpression->add($qb->expr()->like('LOWER(o.kind)', ':' . $parameterName));
                    $qb->setParameter($parameterName, $pattern);
                }
                $qb->andWhere($categoryExpression);
            }
        }

        $perPage = 10;

        return new Paginator(
            $qb->setFirstResult(($page - 1) * $perPage)
                ->setMaxResults($perPage)
        );
    }
    //    /**
    //     * @return Offers[] Returns an array of Offers objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('o')
    //            ->andWhere('o.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('o.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Offers
    //    {
    //        return $this->createQueryBuilder('o')
    //            ->andWhere('o.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}

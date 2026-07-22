<?php

namespace App\Repository;

use App\Entity\Offers;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Offers>
 */
class OffersRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Offers::class);
    }

    public function search(array $filters): array
    {
        $qb = $this->createQueryBuilder('o')

            ->leftJoin('o.company_id', 'c')
            ->leftJoin('o.category_id', 'cat')

            ->andWhere('o.published_at >= :expiry')
            ->setParameter('expiry', new \DateTimeImmutable('-30 days'))
            ->orderBy('o.published_at', 'DESC');


        if (!empty($filters['q'])) {
            $qb->andWhere('LOWER(o.title) LIKE :q OR LOWER(o.description) LIKE :q')
                ->setParameter('q', '%' . mb_strtolower($filters['q']) . '%');
        }

        if (!empty($filters['city'])) {
            $qb->andWhere('LOWER(o.city) = :city')
                ->setParameter('city', mb_strtolower($filters['city']));
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
            $qb->andWhere('o.contract = :contract')
                ->setParameter('contract', $filters['contract']);
        }

        if (!empty($filters['kind'])) {
            $qb->andWhere('o.kind = :kind')
                ->setParameter('kind', $filters['kind']);
        }

        /*
        if (isset($filters['remote']) && $filters['remote'] !== null) {
            $qb->andWhere('o.is_remote = :remote')
                ->setParameter('remote', filter_var($filters['remote'], FILTER_VALIDATE_BOOL));
        }
*/

        if (!empty($filters['salaryMin'])) {
            $qb->andWhere('COALESCE(o.salary_max, o.salary_min) >= :salaryMin')
                ->setParameter('salaryMin', (int) $filters['salaryMin']);
        }


        if (!empty($filters['category'])) {
            $qb->andWhere('LOWER(cat.name) = :category')
                ->setParameter('category', mb_strtolower($filters['category']));
        }

        return $qb->getQuery()->getResult();
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

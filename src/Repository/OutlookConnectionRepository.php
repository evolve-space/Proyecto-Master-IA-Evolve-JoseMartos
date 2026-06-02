<?php

namespace App\Repository;

use App\Entity\OutlookConnection;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<OutlookConnection>
 */
class OutlookConnectionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, OutlookConnection::class);
    }

    public function findLatest(): ?OutlookConnection
    {
        return $this->createQueryBuilder('o')
            ->orderBy('o.updatedAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}

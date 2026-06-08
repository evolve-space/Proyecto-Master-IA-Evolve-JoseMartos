<?php

namespace App\Repository;

use App\Entity\CalendarioCategoria;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CalendarioCategoria>
 */
class CalendarioCategoriaRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CalendarioCategoria::class);
    }

    /** @return list<CalendarioCategoria> */
    public function findAllOrdered(): array
    {
        return $this->createQueryBuilder('c')
            ->orderBy('c.nombre', 'ASC')
            ->getQuery()
            ->getResult();
    }
}

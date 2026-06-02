<?php

namespace App\Repository;

use App\Entity\Email;
use App\Entity\Proveedor;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Email>
 */
class EmailRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Email::class);
    }

    public function findOneByMessageId(string $messageId): ?Email
    {
        return $this->findOneBy(['messageId' => $messageId]);
    }

    /**
     * @return Email[]
     */
    public function findByProveedorOrdered(Proveedor $proveedor): array
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.proveedor = :proveedor')
            ->setParameter('proveedor', $proveedor)
            ->orderBy('e.receivedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Email[]
     */
    public function findAllOrdered(): array
    {
        return $this->createQueryBuilder('e')
            ->orderBy('e.receivedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}

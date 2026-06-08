<?php

namespace App\Repository;

use App\Entity\Contrato;
use App\Entity\Email;
use App\Entity\Importacion;
use App\Entity\Muestra;
use App\Entity\Oferta;
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

    /** @return Email[] */
    public function findByOferta(Oferta $oferta): array
    {
        return $this->findBy(['oferta' => $oferta], ['receivedAt' => 'DESC']);
    }

    /** @return Email[] */
    public function findByMuestra(Muestra $muestra): array
    {
        return $this->findBy(['muestra' => $muestra], ['receivedAt' => 'DESC']);
    }

    /** @return Email[] */
    public function findByContrato(Contrato $contrato): array
    {
        return $this->findBy(['contrato' => $contrato], ['receivedAt' => 'DESC']);
    }

    /** @return Email[] */
    public function findByImportacion(Importacion $importacion): array
    {
        return $this->findBy(['importacion' => $importacion], ['receivedAt' => 'DESC']);
    }
}

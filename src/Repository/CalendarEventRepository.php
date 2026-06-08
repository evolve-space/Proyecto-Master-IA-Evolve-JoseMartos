<?php

namespace App\Repository;

use App\Entity\CalendarEvent;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CalendarEvent>
 */
class CalendarEventRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CalendarEvent::class);
    }

    /**
     * @return CalendarEvent[]
     */
    public function findInRange(\DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.startAt < :to')
            ->andWhere('e.endAt > :from')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->orderBy('e.startAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findOneByGraphEventId(string $graphEventId): ?CalendarEvent
    {
        return $this->findOneBy(['graphEventId' => $graphEventId]);
    }

    /**
     * @return CalendarEvent[]
     */
    public function findByProveedorOrdered(\App\Entity\Proveedor $proveedor): array
    {
        return $this->createQueryBuilder('e')
            ->andWhere('e.proveedor = :proveedor')
            ->setParameter('proveedor', $proveedor)
            ->orderBy('e.startAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /** @return CalendarEvent[] */
    public function findByOferta(\App\Entity\Oferta $oferta): array
    {
        return $this->findBy(['oferta' => $oferta], ['startAt' => 'DESC']);
    }

    /** @return CalendarEvent[] */
    public function findByMuestra(\App\Entity\Muestra $muestra): array
    {
        return $this->findBy(['muestra' => $muestra], ['startAt' => 'DESC']);
    }

    /** @return CalendarEvent[] */
    public function findByContrato(\App\Entity\Contrato $contrato): array
    {
        return $this->findBy(['contrato' => $contrato], ['startAt' => 'DESC']);
    }

    /** @return CalendarEvent[] */
    public function findByImportacion(\App\Entity\Importacion $importacion): array
    {
        return $this->findBy(['importacion' => $importacion], ['startAt' => 'DESC']);
    }
}

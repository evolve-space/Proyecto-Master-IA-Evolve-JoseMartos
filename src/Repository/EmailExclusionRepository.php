<?php

namespace App\Repository;

use App\Entity\EmailExclusion;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<EmailExclusion>
 */
class EmailExclusionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EmailExclusion::class);
    }

    public function existsByMessageId(string $messageId): bool
    {
        $messageId = trim($messageId);
        if ($messageId === '') {
            return false;
        }

        return $this->count(['messageId' => $messageId]) > 0;
    }
}

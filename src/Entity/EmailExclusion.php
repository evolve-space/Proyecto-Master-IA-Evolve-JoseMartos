<?php

namespace App\Entity;

use App\Repository\EmailExclusionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EmailExclusionRepository::class)]
#[ORM\Table(name: 'email_exclusion')]
#[ORM\UniqueConstraint(name: 'uniq_email_exclusion_message_id', columns: ['message_id'])]
class EmailExclusion
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(name: 'message_id', length: 512)]
    private string $messageId;

    #[ORM\Column(name: 'excluded_at')]
    private \DateTimeImmutable $excludedAt;

    public function __construct(string $messageId)
    {
        $this->messageId = $messageId;
        $this->excludedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getMessageId(): string
    {
        return $this->messageId;
    }

    public function getExcludedAt(): \DateTimeImmutable
    {
        return $this->excludedAt;
    }
}

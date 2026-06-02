<?php

namespace App\Entity;

use App\Repository\EmailRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EmailRepository::class)]
#[ORM\Table(name: 'email')]
#[ORM\Index(name: 'idx_email_received_at', columns: ['received_at'])]
#[ORM\Index(name: 'idx_email_status', columns: ['status'])]
class Email
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_READ = 'read';
    public const STATUS_REPLIED = 'replied';
    public const STATUS_CLOSED = 'closed';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'proveedor_id', nullable: true, onDelete: 'SET NULL')]
    private ?Proveedor $proveedor = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'categoria_id', nullable: true, onDelete: 'SET NULL')]
    private ?EmailCategoria $categoria = null;

    #[ORM\Column(name: 'message_id', length: 255, unique: true)]
    private string $messageId = '';

    #[ORM\Column(name: 'conversation_id', length: 255, nullable: true)]
    private ?string $conversationId = null;

    #[ORM\Column(length: 255)]
    private string $sender = '';

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $recipients = null;

    #[ORM\Column(length: 500)]
    private string $subject = '';

    #[ORM\Column(type: Types::TEXT)]
    private string $body = '';

    #[ORM\Column(name: 'received_at', type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $receivedAt;

    #[ORM\Column(length: 20)]
    private string $status = self::STATUS_PENDING;

    #[ORM\Column(name: 'created_at', type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(name: 'has_attachments', options: ['default' => false])]
    private bool $hasAttachments = false;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $attachments = null;

    public function __construct()
    {
        $now = new \DateTimeImmutable();
        $this->receivedAt = $now;
        $this->createdAt = $now;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getProveedor(): ?Proveedor
    {
        return $this->proveedor;
    }

    public function setProveedor(?Proveedor $proveedor): static
    {
        $this->proveedor = $proveedor;

        return $this;
    }

    public function getCategoria(): ?EmailCategoria
    {
        return $this->categoria;
    }

    public function setCategoria(?EmailCategoria $categoria): static
    {
        $this->categoria = $categoria;

        return $this;
    }

    public function getMessageId(): string
    {
        return $this->messageId;
    }

    public function setMessageId(string $messageId): static
    {
        $this->messageId = $messageId;

        return $this;
    }

    public function getConversationId(): ?string
    {
        return $this->conversationId;
    }

    public function setConversationId(?string $conversationId): static
    {
        $this->conversationId = $conversationId;

        return $this;
    }

    public function getSender(): string
    {
        return $this->sender;
    }

    public function setSender(string $sender): static
    {
        $this->sender = $sender;

        return $this;
    }

    public function getRecipients(): ?string
    {
        return $this->recipients;
    }

    public function setRecipients(?string $recipients): static
    {
        $this->recipients = $recipients;

        return $this;
    }

    public function getSubject(): string
    {
        return $this->subject;
    }

    public function setSubject(string $subject): static
    {
        $this->subject = $subject;

        return $this;
    }

    public function getBody(): string
    {
        return $this->body;
    }

    public function setBody(string $body): static
    {
        $this->body = $body;

        return $this;
    }

    public function getReceivedAt(): \DateTimeImmutable
    {
        return $this->receivedAt;
    }

    public function setReceivedAt(\DateTimeImmutable $receivedAt): static
    {
        $this->receivedAt = $receivedAt;

        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $allowed = [
            self::STATUS_PENDING,
            self::STATUS_READ,
            self::STATUS_REPLIED,
            self::STATUS_CLOSED,
        ];
        if (!in_array($status, $allowed, true)) {
            throw new \InvalidArgumentException('Estado de correo no valido.');
        }
        $this->status = $status;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function hasAttachments(): bool
    {
        return $this->hasAttachments;
    }

    public function setHasAttachments(bool $hasAttachments): static
    {
        $this->hasAttachments = $hasAttachments;

        return $this;
    }

    public function getAttachments(): ?array
    {
        return $this->attachments;
    }

    /** @param array<int, array<string, mixed>>|null $attachments */
    public function setAttachments(?array $attachments): static
    {
        $this->attachments = $attachments;

        return $this;
    }
}

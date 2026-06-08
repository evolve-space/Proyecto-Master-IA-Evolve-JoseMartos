<?php

namespace App\Entity;

use App\Repository\CalendarEventRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CalendarEventRepository::class)]
#[ORM\Table(name: 'calendar_event')]
#[ORM\Index(name: 'idx_calendar_event_start', columns: ['start_at'])]
#[ORM\Index(name: 'idx_calendar_event_graph_id', columns: ['graph_event_id'])]
class CalendarEvent
{
    public const SOURCE_LOCAL = 'local';
    public const SOURCE_OUTLOOK = 'outlook';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(name: 'graph_event_id', length: 255, nullable: true, unique: true)]
    private ?string $graphEventId = null;

    #[ORM\Column(length: 500)]
    private string $subject = '';

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $location = null;

    #[ORM\Column(name: 'start_at', type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $startAt;

    #[ORM\Column(name: 'end_at', type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $endAt;

    #[ORM\Column(name: 'all_day', options: ['default' => false])]
    private bool $allDay = false;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $organizer = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    private ?array $attendees = null;

    #[ORM\Column(length: 20, options: ['default' => 'local'])]
    private string $source = self::SOURCE_LOCAL;

    #[ORM\Column(name: 'web_link', length: 1024, nullable: true)]
    private ?string $webLink = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'email_id', nullable: true, onDelete: 'SET NULL')]
    private ?Email $email = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'proveedor_id', nullable: true, onDelete: 'SET NULL')]
    private ?Proveedor $proveedor = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'categoria_id', nullable: true, onDelete: 'SET NULL')]
    private ?CalendarioCategoria $categoria = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'importacion_id', nullable: true, onDelete: 'SET NULL')]
    private ?Importacion $importacion = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'muestra_id', nullable: true, onDelete: 'SET NULL')]
    private ?Muestra $muestra = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'oferta_id', nullable: true, onDelete: 'SET NULL')]
    private ?Oferta $oferta = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'contrato_id', nullable: true, onDelete: 'SET NULL')]
    private ?Contrato $contrato = null;

    #[ORM\Column(length: 10, options: ['default' => 'normal'])]
    private string $urgency = 'normal';

    #[ORM\Column(name: 'created_at', type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(name: 'updated_at', type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $now = new \DateTimeImmutable();
        $this->startAt = $now;
        $this->endAt = $now->modify('+1 hour');
        $this->createdAt = $now;
        $this->updatedAt = $now;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getGraphEventId(): ?string
    {
        return $this->graphEventId;
    }

    public function setGraphEventId(?string $graphEventId): static
    {
        $this->graphEventId = $graphEventId;

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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(?string $location): static
    {
        $this->location = $location;

        return $this;
    }

    public function getStartAt(): \DateTimeImmutable
    {
        return $this->startAt;
    }

    public function setStartAt(\DateTimeImmutable $startAt): static
    {
        $this->startAt = $startAt;

        return $this;
    }

    public function getEndAt(): \DateTimeImmutable
    {
        return $this->endAt;
    }

    public function setEndAt(\DateTimeImmutable $endAt): static
    {
        $this->endAt = $endAt;

        return $this;
    }

    public function isAllDay(): bool
    {
        return $this->allDay;
    }

    public function setAllDay(bool $allDay): static
    {
        $this->allDay = $allDay;

        return $this;
    }

    public function getOrganizer(): ?string
    {
        return $this->organizer;
    }

    public function setOrganizer(?string $organizer): static
    {
        $this->organizer = $organizer;

        return $this;
    }

    /**
     * @return array<int, mixed>|null
     */
    public function getAttendees(): ?array
    {
        return $this->attendees;
    }

    /**
     * @param array<int, mixed>|null $attendees
     */
    public function setAttendees(?array $attendees): static
    {
        $this->attendees = $attendees;

        return $this;
    }

    public function getSource(): string
    {
        return $this->source;
    }

    public function setSource(string $source): static
    {
        $this->source = $source;

        return $this;
    }

    public function getWebLink(): ?string
    {
        return $this->webLink;
    }

    public function setWebLink(?string $webLink): static
    {
        $this->webLink = $webLink;

        return $this;
    }

    public function getEmail(): ?Email
    {
        return $this->email;
    }

    public function setEmail(?Email $email): static
    {
        $this->email = $email;

        return $this;
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

    public function getCategoria(): ?CalendarioCategoria
    {
        return $this->categoria;
    }

    public function setCategoria(?CalendarioCategoria $categoria): static
    {
        $this->categoria = $categoria;

        return $this;
    }

    public function getImportacion(): ?Importacion
    {
        return $this->importacion;
    }

    public function setImportacion(?Importacion $importacion): static
    {
        $this->importacion = $importacion;

        return $this;
    }

    public function getMuestra(): ?Muestra
    {
        return $this->muestra;
    }

    public function setMuestra(?Muestra $muestra): static
    {
        $this->muestra = $muestra;

        return $this;
    }

    public function getOferta(): ?Oferta
    {
        return $this->oferta;
    }

    public function setOferta(?Oferta $oferta): static
    {
        $this->oferta = $oferta;

        return $this;
    }

    public function getContrato(): ?Contrato
    {
        return $this->contrato;
    }

    public function setContrato(?Contrato $contrato): static
    {
        $this->contrato = $contrato;

        return $this;
    }

    public function getUrgency(): string
    {
        return $this->urgency;
    }

    public function setUrgency(string $urgency): static
    {
        if (!in_array($urgency, ['baja', 'normal', 'alta'], true)) {
            throw new \InvalidArgumentException('Urgencia no valida.');
        }
        $this->urgency = $urgency;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function touch(): static
    {
        $this->updatedAt = new \DateTimeImmutable();

        return $this;
    }
}

<?php

namespace App\Entity;

use App\Repository\MuestraRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MuestraRepository::class)]
class Muestra
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $fecha = null;

    #[ORM\ManyToOne(inversedBy: 'muestras')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Proveedor $proveedor = null;

    /** Compra | Análisis | Pendiente */
    #[ORM\Column(length: 20, nullable: true)]
    private ?string $estado = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $idLote = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $producto = null;

    /** BIO | HALAL | KOSHER | FOOD */
    #[ORM\Column(length: 10, nullable: true)]
    private ?string $grado = null;

    #[ORM\Column(nullable: true)]
    private ?bool $documentacion = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $observaciones = null;

    #[ORM\ManyToOne(inversedBy: 'muestras')]
    #[ORM\JoinColumn(nullable: true)]
    private ?Usuario $usuario = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFecha(): ?\DateTimeInterface
    {
        return $this->fecha;
    }

    public function setFecha(?\DateTimeInterface $fecha): static
    {
        $this->fecha = $fecha;

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

    public function getEstado(): ?string
    {
        return $this->estado;
    }

    public function setEstado(?string $estado): static
    {
        $this->estado = $estado;

        return $this;
    }

    public function getIdLote(): ?string
    {
        return $this->idLote;
    }

    public function setIdLote(?string $idLote): static
    {
        $this->idLote = $idLote;

        return $this;
    }

    public function getProducto(): ?string
    {
        return $this->producto;
    }

    public function setProducto(?string $producto): static
    {
        $this->producto = $producto;

        return $this;
    }

    public function getGrado(): ?string
    {
        return $this->grado;
    }

    public function setGrado(?string $grado): static
    {
        $this->grado = $grado;

        return $this;
    }

    public function getDocumentacion(): ?bool
    {
        return $this->documentacion;
    }

    public function setDocumentacion(?bool $documentacion): static
    {
        $this->documentacion = $documentacion;

        return $this;
    }

    public function getObservaciones(): ?string
    {
        return $this->observaciones;
    }

    public function setObservaciones(?string $observaciones): static
    {
        $this->observaciones = $observaciones;

        return $this;
    }

    public function getUsuario(): ?Usuario
    {
        return $this->usuario;
    }

    public function setUsuario(?Usuario $usuario): static
    {
        $this->usuario = $usuario;

        return $this;
    }
}

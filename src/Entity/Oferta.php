<?php

namespace App\Entity;

use App\Repository\OfertaRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OfertaRepository::class)]
class Oferta
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $fecha = null;

    #[ORM\ManyToOne(inversedBy: 'ofertas')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Proveedor $proveedor = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $producto = null;

    /** Food Grade | Feed Grade | Reach */
    #[ORM\Column(length: 20, nullable: true)]
    private ?string $grado = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 3, nullable: true)]
    private ?string $cantidad = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 4, nullable: true)]
    private ?string $precio = null;

    #[ORM\Column(length: 10, nullable: true)]
    private ?string $moneda = null;

    #[ORM\Column(length: 10, nullable: true)]
    private ?string $incoterm = null;

    #[ORM\Column(nullable: true)]
    private ?bool $muestra = null;

    /** Contrato | Pedido */
    #[ORM\Column(length: 10, nullable: true)]
    private ?string $tipo = null;

    #[ORM\Column(nullable: true)]
    private ?bool $documentacion = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $observaciones = null;

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

    public function getCantidad(): ?string
    {
        return $this->cantidad;
    }

    public function setCantidad(?string $cantidad): static
    {
        $this->cantidad = $cantidad;

        return $this;
    }

    public function getPrecio(): ?string
    {
        return $this->precio;
    }

    public function setPrecio(?string $precio): static
    {
        $this->precio = $precio;

        return $this;
    }

    public function getMoneda(): ?string
    {
        return $this->moneda;
    }

    public function setMoneda(?string $moneda): static
    {
        $this->moneda = $moneda;

        return $this;
    }

    public function getIncoterm(): ?string
    {
        return $this->incoterm;
    }

    public function setIncoterm(?string $incoterm): static
    {
        $this->incoterm = $incoterm;

        return $this;
    }

    public function getMuestra(): ?bool
    {
        return $this->muestra;
    }

    public function setMuestra(?bool $muestra): static
    {
        $this->muestra = $muestra;

        return $this;
    }

    public function getTipo(): ?string
    {
        return $this->tipo;
    }

    public function setTipo(?string $tipo): static
    {
        $this->tipo = $tipo;

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
}

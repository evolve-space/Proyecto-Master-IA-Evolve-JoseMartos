<?php

namespace App\Entity;

use App\Repository\ContratoRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ContratoRepository::class)]
class Contrato
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $fecha = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $numeroContrato = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $producto = null;

    #[ORM\ManyToOne(inversedBy: 'contratos')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Proveedor $proveedor = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 4, nullable: true)]
    private ?string $precio = null;

    /** BIO | HALAL | KOSHER | FOOD */
    #[ORM\Column(length: 10, nullable: true)]
    private ?string $grado = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 3, nullable: true)]
    private ?string $cantidad = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 3, nullable: true)]
    private ?string $cantidadPedida = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 3, nullable: true)]
    private ?string $cantidadPendiente = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $fechaCaducidad = null;

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

    public function getNumeroContrato(): ?string
    {
        return $this->numeroContrato;
    }

    public function setNumeroContrato(?string $numeroContrato): static
    {
        $this->numeroContrato = $numeroContrato;

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

    public function getProveedor(): ?Proveedor
    {
        return $this->proveedor;
    }

    public function setProveedor(?Proveedor $proveedor): static
    {
        $this->proveedor = $proveedor;

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

    public function getCantidadPedida(): ?string
    {
        return $this->cantidadPedida;
    }

    public function setCantidadPedida(?string $cantidadPedida): static
    {
        $this->cantidadPedida = $cantidadPedida;

        return $this;
    }

    public function getCantidadPendiente(): ?string
    {
        return $this->cantidadPendiente;
    }

    public function setCantidadPendiente(?string $cantidadPendiente): static
    {
        $this->cantidadPendiente = $cantidadPendiente;

        return $this;
    }

    public function getFechaCaducidad(): ?\DateTimeInterface
    {
        return $this->fechaCaducidad;
    }

    public function setFechaCaducidad(?\DateTimeInterface $fechaCaducidad): static
    {
        $this->fechaCaducidad = $fechaCaducidad;

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

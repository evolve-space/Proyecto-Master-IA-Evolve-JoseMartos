<?php

namespace App\Entity;

use App\Repository\ImportacionRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ImportacionRepository::class)]
class Importacion
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $fechaDuaAlbaran = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $fechaFactura = null;

    #[ORM\ManyToOne(inversedBy: 'importaciones')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Proveedor $proveedor = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $producto = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 3, nullable: true)]
    private ?string $cantidad = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 2, nullable: true)]
    private ?string $importeEur = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2, nullable: true)]
    private ?string $aranceles = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 2, nullable: true)]
    private ?string $costeDespacho = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 4, nullable: true)]
    private ?string $gastoImpKg = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 4, nullable: true)]
    private ?string $costeKg = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 15, scale: 2, nullable: true)]
    private ?string $importeUsd = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 4, nullable: true)]
    private ?string $tipoCambio = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $forwarderer = null;

    /** EXW | CIF | CIP | CFR */
    #[ORM\Column(length: 10, nullable: true)]
    private ?string $incoterm = null;

    #[ORM\Column(nullable: true)]
    private ?bool $documentacion = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $observaciones = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFechaDuaAlbaran(): ?\DateTimeInterface
    {
        return $this->fechaDuaAlbaran;
    }

    public function setFechaDuaAlbaran(?\DateTimeInterface $fechaDuaAlbaran): static
    {
        $this->fechaDuaAlbaran = $fechaDuaAlbaran;

        return $this;
    }

    public function getFechaFactura(): ?\DateTimeInterface
    {
        return $this->fechaFactura;
    }

    public function setFechaFactura(?\DateTimeInterface $fechaFactura): static
    {
        $this->fechaFactura = $fechaFactura;

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

    public function getCantidad(): ?string
    {
        return $this->cantidad;
    }

    public function setCantidad(?string $cantidad): static
    {
        $this->cantidad = $cantidad;

        return $this;
    }

    public function getImporteEur(): ?string
    {
        return $this->importeEur;
    }

    public function setImporteEur(?string $importeEur): static
    {
        $this->importeEur = $importeEur;

        return $this;
    }

    public function getAranceles(): ?string
    {
        return $this->aranceles;
    }

    public function setAranceles(?string $aranceles): static
    {
        $this->aranceles = $aranceles;

        return $this;
    }

    public function getCosteDespacho(): ?string
    {
        return $this->costeDespacho;
    }

    public function setCosteDespacho(?string $costeDespacho): static
    {
        $this->costeDespacho = $costeDespacho;

        return $this;
    }

    public function getGastoImpKg(): ?string
    {
        return $this->gastoImpKg;
    }

    public function setGastoImpKg(?string $gastoImpKg): static
    {
        $this->gastoImpKg = $gastoImpKg;

        return $this;
    }

    public function getCosteKg(): ?string
    {
        return $this->costeKg;
    }

    public function setCosteKg(?string $costeKg): static
    {
        $this->costeKg = $costeKg;

        return $this;
    }

    public function getImporteUsd(): ?string
    {
        return $this->importeUsd;
    }

    public function setImporteUsd(?string $importeUsd): static
    {
        $this->importeUsd = $importeUsd;

        return $this;
    }

    public function getTipoCambio(): ?string
    {
        return $this->tipoCambio;
    }

    public function setTipoCambio(?string $tipoCambio): static
    {
        $this->tipoCambio = $tipoCambio;

        return $this;
    }

    public function getForwarderer(): ?string
    {
        return $this->forwarderer;
    }

    public function setForwarderer(?string $forwarderer): static
    {
        $this->forwarderer = $forwarderer;

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

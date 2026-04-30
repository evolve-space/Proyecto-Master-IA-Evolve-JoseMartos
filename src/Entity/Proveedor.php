<?php

namespace App\Entity;

use App\Repository\ProveedorRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProveedorRepository::class)]
class Proveedor
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $nombre = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $cifNif = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $telefono = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $web = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $actividad = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $direccionFacturacion = null;

    /** Fabricante | Distribuidor */
    #[ORM\Column(length: 20, nullable: true)]
    private ?string $tipo = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $certificaciones = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $contactoPrincipal = null;

    /** 30 | 60 | 75 */
    #[ORM\Column(nullable: true)]
    private ?int $formaPago = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $email = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $movil = null;

    /** EXW | CIF | CIP | CFR */
    #[ORM\Column(length: 10, nullable: true)]
    private ?string $incoterm = null;

    #[ORM\Column(nullable: true)]
    private ?bool $documentacion = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $observaciones = null;

    #[ORM\OneToMany(targetEntity: Importacion::class, mappedBy: 'proveedor')]
    private Collection $importaciones;

    #[ORM\OneToMany(targetEntity: Contrato::class, mappedBy: 'proveedor')]
    private Collection $contratos;

    #[ORM\OneToMany(targetEntity: Oferta::class, mappedBy: 'proveedor')]
    private Collection $ofertas;

    #[ORM\OneToMany(targetEntity: Muestra::class, mappedBy: 'proveedor')]
    private Collection $muestras;

    public function __construct()
    {
        $this->importaciones = new ArrayCollection();
        $this->contratos = new ArrayCollection();
        $this->ofertas = new ArrayCollection();
        $this->muestras = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    public function setNombre(?string $nombre): static
    {
        $this->nombre = $nombre;

        return $this;
    }

    public function getCifNif(): ?string
    {
        return $this->cifNif;
    }

    public function setCifNif(?string $cifNif): static
    {
        $this->cifNif = $cifNif;

        return $this;
    }

    public function getTelefono(): ?string
    {
        return $this->telefono;
    }

    public function setTelefono(?string $telefono): static
    {
        $this->telefono = $telefono;

        return $this;
    }

    public function getWeb(): ?string
    {
        return $this->web;
    }

    public function setWeb(?string $web): static
    {
        $this->web = $web;

        return $this;
    }

    public function getActividad(): ?string
    {
        return $this->actividad;
    }

    public function setActividad(?string $actividad): static
    {
        $this->actividad = $actividad;

        return $this;
    }

    public function getDireccionFacturacion(): ?string
    {
        return $this->direccionFacturacion;
    }

    public function setDireccionFacturacion(?string $direccionFacturacion): static
    {
        $this->direccionFacturacion = $direccionFacturacion;

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

    public function getCertificaciones(): ?string
    {
        return $this->certificaciones;
    }

    public function setCertificaciones(?string $certificaciones): static
    {
        $this->certificaciones = $certificaciones;

        return $this;
    }

    public function getContactoPrincipal(): ?string
    {
        return $this->contactoPrincipal;
    }

    public function setContactoPrincipal(?string $contactoPrincipal): static
    {
        $this->contactoPrincipal = $contactoPrincipal;

        return $this;
    }

    public function getFormaPago(): ?int
    {
        return $this->formaPago;
    }

    public function setFormaPago(?int $formaPago): static
    {
        $this->formaPago = $formaPago;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getMovil(): ?string
    {
        return $this->movil;
    }

    public function setMovil(?string $movil): static
    {
        $this->movil = $movil;

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

    /** @return Collection<int, Importacion> */
    public function getImportaciones(): Collection
    {
        return $this->importaciones;
    }

    public function addImportacion(Importacion $importacion): static
    {
        if (!$this->importaciones->contains($importacion)) {
            $this->importaciones->add($importacion);
            $importacion->setProveedor($this);
        }

        return $this;
    }

    public function removeImportacion(Importacion $importacion): static
    {
        if ($this->importaciones->removeElement($importacion)) {
            if ($importacion->getProveedor() === $this) {
                $importacion->setProveedor(null);
            }
        }

        return $this;
    }

    /** @return Collection<int, Contrato> */
    public function getContratos(): Collection
    {
        return $this->contratos;
    }

    public function addContrato(Contrato $contrato): static
    {
        if (!$this->contratos->contains($contrato)) {
            $this->contratos->add($contrato);
            $contrato->setProveedor($this);
        }

        return $this;
    }

    public function removeContrato(Contrato $contrato): static
    {
        if ($this->contratos->removeElement($contrato)) {
            if ($contrato->getProveedor() === $this) {
                $contrato->setProveedor(null);
            }
        }

        return $this;
    }

    /** @return Collection<int, Oferta> */
    public function getOfertas(): Collection
    {
        return $this->ofertas;
    }

    public function addOferta(Oferta $oferta): static
    {
        if (!$this->ofertas->contains($oferta)) {
            $this->ofertas->add($oferta);
            $oferta->setProveedor($this);
        }

        return $this;
    }

    public function removeOferta(Oferta $oferta): static
    {
        if ($this->ofertas->removeElement($oferta)) {
            if ($oferta->getProveedor() === $this) {
                $oferta->setProveedor(null);
            }
        }

        return $this;
    }

    /** @return Collection<int, Muestra> */
    public function getMuestras(): Collection
    {
        return $this->muestras;
    }

    public function addMuestra(Muestra $muestra): static
    {
        if (!$this->muestras->contains($muestra)) {
            $this->muestras->add($muestra);
            $muestra->setProveedor($this);
        }

        return $this;
    }

    public function removeMuestra(Muestra $muestra): static
    {
        if ($this->muestras->removeElement($muestra)) {
            if ($muestra->getProveedor() === $this) {
                $muestra->setProveedor(null);
            }
        }

        return $this;
    }
}

<?php

namespace App\Entity;

use App\Repository\UsuarioRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UsuarioRepository::class)]
class Usuario
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $nombre = null;

    /** superadmin | admin | normal */
    #[ORM\Column(length: 15)]
    private ?string $tipo = null;

    #[ORM\OneToMany(targetEntity: Muestra::class, mappedBy: 'usuario')]
    private Collection $muestras;

    public function __construct()
    {
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

    public function setNombre(string $nombre): static
    {
        $this->nombre = $nombre;

        return $this;
    }

    public function getTipo(): ?string
    {
        return $this->tipo;
    }

    public function setTipo(string $tipo): static
    {
        $this->tipo = $tipo;

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
            $muestra->setUsuario($this);
        }

        return $this;
    }

    public function removeMuestra(Muestra $muestra): static
    {
        if ($this->muestras->removeElement($muestra)) {
            if ($muestra->getUsuario() === $this) {
                $muestra->setUsuario(null);
            }
        }

        return $this;
    }
}

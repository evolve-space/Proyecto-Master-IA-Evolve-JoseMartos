<?php

namespace App\Entity;

use App\Repository\UsuarioRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UsuarioRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_USERNAME', fields: ['username'])]
class Usuario implements UserInterface, PasswordAuthenticatedUserInterface
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

    #[ORM\Column(length: 180, unique: true)]
    private ?string $username = null;

    #[ORM\Column(length: 180, unique: true, nullable: true)]
    private ?string $email = null;

    #[ORM\Column]
    private ?string $password = null;

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

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    // --- UserInterface ---

    public function getUserIdentifier(): string
    {
        return (string) $this->username;
    }

    public function getRoles(): array
    {
        return match ($this->tipo) {
            'superadmin' => ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER'],
            'admin'      => ['ROLE_ADMIN', 'ROLE_USER'],
            default      => ['ROLE_USER'],
        };
    }

    public function eraseCredentials(): void
    {
        // no plain-text password stored
    }

    // --- Muestras ---

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

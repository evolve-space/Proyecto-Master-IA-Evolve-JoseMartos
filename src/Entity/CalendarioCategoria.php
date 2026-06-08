<?php

namespace App\Entity;

use App\Repository\CalendarioCategoriaRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CalendarioCategoriaRepository::class)]
#[ORM\Table(name: 'calendario_categoria')]
class CalendarioCategoria
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private string $nombre = '';

    #[ORM\Column(length: 7)]
    private string $color = '#64748b';

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNombre(): string
    {
        return $this->nombre;
    }

    public function setNombre(string $nombre): static
    {
        $this->nombre = trim($nombre);

        return $this;
    }

    public function getColor(): string
    {
        return $this->color;
    }

    public function setColor(string $color): static
    {
        $color = trim($color);
        if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $color)) {
            throw new \InvalidArgumentException('Color invalido. Use formato #RRGGBB.');
        }
        $this->color = strtolower($color);

        return $this;
    }
}

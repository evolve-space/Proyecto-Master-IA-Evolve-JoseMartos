<?php

namespace App\Security;

use App\Entity\Usuario;
use App\Repository\UsuarioRepository;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

final class UsuarioUserProvider implements UserProviderInterface
{
    public function __construct(
        private readonly UsuarioRepository $usuarios,
    ) {
    }

    public function loadUserByIdentifier(string $identifier): UserInterface
    {
        $user = $this->usuarios->findOneByLoginIdentifier($identifier);
        if (!$user instanceof Usuario) {
            throw new UserNotFoundException(sprintf('Usuario "%s" no encontrado.', $identifier));
        }

        return $user;
    }

    public function refreshUser(UserInterface $user): UserInterface
    {
        if (!$user instanceof Usuario) {
            throw new \InvalidArgumentException(sprintf('Se esperaba %s.', Usuario::class));
        }

        return $this->loadUserByIdentifier($user->getUserIdentifier());
    }

    public function supportsClass(string $class): bool
    {
        return Usuario::class === $class || is_subclass_of($class, Usuario::class);
    }
}

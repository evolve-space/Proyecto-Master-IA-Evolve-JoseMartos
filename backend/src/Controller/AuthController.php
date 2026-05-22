<?php

namespace App\Controller;

use App\Entity\Usuario;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api', name: 'api_auth_')]
class AuthController extends AbstractController
{
    /**
     * El firewall intercepta esta ruta antes de que llegue al controlador.
     * Este método nunca se ejecuta realmente.
     */
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        throw new \LogicException('This method should not be reached — intercepted by the firewall.');
    }

    /**
     * Devuelve los datos del usuario autenticado.
     * El login en sí lo maneja el firewall (POST /api/login).
     */
    #[Route('/me', name: 'me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var Usuario $user */
        $user = $this->getUser();

        return $this->json([
            'id'       => $user->getId(),
            'nombre'   => $user->getNombre(),
            'username' => $user->getUsername(),
            'email'    => $user->getEmail(),
            'tipo'     => $user->getTipo(),
            'roles'    => $user->getRoles(),
        ]);
    }
}

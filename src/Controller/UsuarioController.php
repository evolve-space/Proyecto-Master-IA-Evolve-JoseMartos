<?php

namespace App\Controller;

use App\Entity\Usuario;
use App\Repository\UsuarioRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/usuarios', name: 'api_usuario_')]
class UsuarioController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(UsuarioRepository $repo): JsonResponse
    {
        return $this->json(array_map(fn(Usuario $u) => $this->serialize($u), $repo->findAll()));
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(Usuario $usuario): JsonResponse
    {
        return $this->json($this->serialize($usuario));
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $hasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['nombre']) || empty($data['tipo']) || empty($data['username']) || empty($data['password'])) {
            return $this->json(['error' => 'Los campos nombre, tipo, username y password son obligatorios.'], Response::HTTP_BAD_REQUEST);
        }

        $usuario = new Usuario();
        $this->hydrate($usuario, $data, $hasher);
        $em->persist($usuario);
        $em->flush();

        return $this->json($this->serialize($usuario), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(Usuario $usuario, Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $hasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $this->hydrate($usuario, $data, $hasher);
        $em->flush();

        return $this->json($this->serialize($usuario));
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(Usuario $usuario, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($usuario);
        $em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    private function hydrate(Usuario $u, array $data, UserPasswordHasherInterface $hasher): void
    {
        if (array_key_exists('nombre', $data))   $u->setNombre($data['nombre']);
        if (array_key_exists('tipo', $data))     $u->setTipo($data['tipo']);
        if (array_key_exists('username', $data)) $u->setUsername($data['username']);
        if (array_key_exists('email', $data))    $u->setEmail($data['email']);
        if (!empty($data['password']))           $u->setPassword($hasher->hashPassword($u, $data['password']));
    }

    private function serialize(Usuario $u): array
    {
        return [
            'id'       => $u->getId(),
            'nombre'   => $u->getNombre(),
            'username' => $u->getUsername(),
            'email'    => $u->getEmail(),
            'tipo'     => $u->getTipo(),
        ];
    }
}

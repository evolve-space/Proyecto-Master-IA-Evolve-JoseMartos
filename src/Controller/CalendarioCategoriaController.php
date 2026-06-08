<?php

namespace App\Controller;

use App\Entity\CalendarioCategoria;
use App\Repository\CalendarioCategoriaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/calendario-categorias', name: 'api_calendario_categoria_')]
class CalendarioCategoriaController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(CalendarioCategoriaRepository $repo): JsonResponse
    {
        return $this->json(array_map(fn (CalendarioCategoria $c) => $this->serialize($c), $repo->findAllOrdered()));
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(CalendarioCategoria $categoria): JsonResponse
    {
        return $this->json($this->serialize($categoria));
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalido.'], Response::HTTP_BAD_REQUEST);
        }

        $nombre = trim((string) ($data['nombre'] ?? ''));
        if ($nombre === '') {
            return $this->json(['error' => 'El nombre es obligatorio.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $categoria = new CalendarioCategoria();
            $categoria->setNombre($nombre);
            $categoria->setColor((string) ($data['color'] ?? '#64748b'));
            $em->persist($categoria);
            $em->flush();

            return $this->json($this->serialize($categoria), Response::HTTP_CREATED);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(CalendarioCategoria $categoria, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalido.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            if (array_key_exists('nombre', $data)) {
                $nombre = trim((string) $data['nombre']);
                if ($nombre === '') {
                    return $this->json(['error' => 'El nombre es obligatorio.'], Response::HTTP_BAD_REQUEST);
                }
                $categoria->setNombre($nombre);
            }
            if (array_key_exists('color', $data)) {
                $categoria->setColor((string) $data['color']);
            }
            $em->flush();

            return $this->json($this->serialize($categoria));
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(CalendarioCategoria $categoria, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($categoria);
        $em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    /** @return array<string, mixed> */
    private function serialize(CalendarioCategoria $categoria): array
    {
        return [
            'id' => $categoria->getId(),
            'nombre' => $categoria->getNombre(),
            'color' => $categoria->getColor(),
        ];
    }
}

<?php

namespace App\Controller;

use App\Entity\Muestra;
use App\Repository\MuestraRepository;
use App\Repository\ProveedorRepository;
use App\Repository\UsuarioRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/muestras', name: 'api_muestra_')]
class MuestraController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(MuestraRepository $repo): JsonResponse
    {
        return $this->json(array_map(fn(Muestra $m) => $this->serialize($m), $repo->findAll()));
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(Muestra $muestra): JsonResponse
    {
        return $this->json($this->serialize($muestra));
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, ProveedorRepository $proveedorRepo, UsuarioRepository $usuarioRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['proveedorId'])) {
            return $this->json(['error' => 'El campo proveedorId es obligatorio.'], Response::HTTP_BAD_REQUEST);
        }

        $proveedor = $proveedorRepo->find($data['proveedorId']);
        if (!$proveedor) {
            return $this->json(['error' => 'Proveedor no encontrado.'], Response::HTTP_NOT_FOUND);
        }

        $muestra = new Muestra();
        $muestra->setProveedor($proveedor);

        if (!empty($data['usuarioId'])) {
            $usuario = $usuarioRepo->find($data['usuarioId']);
            if (!$usuario) {
                return $this->json(['error' => 'Usuario no encontrado.'], Response::HTTP_NOT_FOUND);
            }
            $muestra->setUsuario($usuario);
        }

        $this->hydrate($muestra, $data);
        $em->persist($muestra);
        $em->flush();

        return $this->json($this->serialize($muestra), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(Muestra $muestra, Request $request, EntityManagerInterface $em, ProveedorRepository $proveedorRepo, UsuarioRepository $usuarioRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!empty($data['proveedorId'])) {
            $proveedor = $proveedorRepo->find($data['proveedorId']);
            if (!$proveedor) {
                return $this->json(['error' => 'Proveedor no encontrado.'], Response::HTTP_NOT_FOUND);
            }
            $muestra->setProveedor($proveedor);
        }

        if (array_key_exists('usuarioId', $data)) {
            $usuario = $data['usuarioId'] ? $usuarioRepo->find($data['usuarioId']) : null;
            $muestra->setUsuario($usuario);
        }

        $this->hydrate($muestra, $data);
        $em->flush();

        return $this->json($this->serialize($muestra));
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(Muestra $muestra, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($muestra);
        $em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    private function hydrate(Muestra $m, array $data): void
    {
        if (array_key_exists('fecha', $data))         $m->setFecha($data['fecha'] ? new \DateTime($data['fecha']) : null);
        if (array_key_exists('estado', $data))        $m->setEstado($data['estado']);
        if (array_key_exists('idLote', $data))        $m->setIdLote($data['idLote']);
        if (array_key_exists('producto', $data))      $m->setProducto($data['producto']);
        if (array_key_exists('grado', $data))         $m->setGrado($data['grado']);
        if (array_key_exists('documentacion', $data)) $m->setDocumentacion($data['documentacion'] !== null ? (bool)$data['documentacion'] : null);
        if (array_key_exists('observaciones', $data)) $m->setObservaciones($data['observaciones']);
    }

    private function serialize(Muestra $m): array
    {
        return [
            'id'             => $m->getId(),
            'fecha'          => $m->getFecha()?->format('Y-m-d'),
            'proveedorId'    => $m->getProveedor()?->getId(),
            'proveedorNombre'=> $m->getProveedor()?->getNombre(),
            'estado'         => $m->getEstado(),
            'idLote'         => $m->getIdLote(),
            'producto'       => $m->getProducto(),
            'grado'          => $m->getGrado(),
            'documentacion'  => $m->getDocumentacion(),
            'observaciones'  => $m->getObservaciones(),
            'usuarioId'      => $m->getUsuario()?->getId(),
            'usuarioNombre'  => $m->getUsuario()?->getNombre(),
        ];
    }
}

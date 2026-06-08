<?php

namespace App\Controller;

use App\Entity\Contrato;
use App\Repository\ContratoRepository;
use App\Repository\ProveedorRepository;
use App\Service\EntityFichaService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/contratos', name: 'api_contrato_')]
class ContratoController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(ContratoRepository $repo): JsonResponse
    {
        return $this->json(array_map(fn(Contrato $c) => $this->serialize($c), $repo->findAll()));
    }

    #[Route('/{id}/ficha', name: 'ficha', methods: ['GET'])]
    public function ficha(Contrato $contrato, EntityFichaService $fichaService): JsonResponse
    {
        $ficha = $fichaService->forContrato($contrato);

        return $this->json([
            'entity' => $this->serialize($contrato),
            'stats' => $ficha['stats'],
            'items' => $ficha['items'],
        ]);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(Contrato $contrato): JsonResponse
    {
        return $this->json($this->serialize($contrato));
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, ProveedorRepository $proveedorRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['proveedorId'])) {
            return $this->json(['error' => 'El campo proveedorId es obligatorio.'], Response::HTTP_BAD_REQUEST);
        }

        $proveedor = $proveedorRepo->find($data['proveedorId']);
        if (!$proveedor) {
            return $this->json(['error' => 'Proveedor no encontrado.'], Response::HTTP_NOT_FOUND);
        }

        $contrato = new Contrato();
        $contrato->setProveedor($proveedor);
        $this->hydrate($contrato, $data);
        $em->persist($contrato);
        $em->flush();

        return $this->json($this->serialize($contrato), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(Contrato $contrato, Request $request, EntityManagerInterface $em, ProveedorRepository $proveedorRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!empty($data['proveedorId'])) {
            $proveedor = $proveedorRepo->find($data['proveedorId']);
            if (!$proveedor) {
                return $this->json(['error' => 'Proveedor no encontrado.'], Response::HTTP_NOT_FOUND);
            }
            $contrato->setProveedor($proveedor);
        }

        $this->hydrate($contrato, $data);
        $em->flush();

        return $this->json($this->serialize($contrato));
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(Contrato $contrato, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($contrato);
        $em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    private function hydrate(Contrato $c, array $data): void
    {
        if (array_key_exists('fecha', $data))               $c->setFecha($data['fecha'] ? new \DateTime($data['fecha']) : null);
        if (array_key_exists('numeroContrato', $data))      $c->setNumeroContrato($data['numeroContrato']);
        if (array_key_exists('producto', $data))            $c->setProducto($data['producto']);
        if (array_key_exists('precio', $data))              $c->setPrecio($data['precio']);
        if (array_key_exists('grado', $data))               $c->setGrado($data['grado']);
        if (array_key_exists('cantidad', $data))            $c->setCantidad($data['cantidad']);
        if (array_key_exists('cantidadPedida', $data))      $c->setCantidadPedida($data['cantidadPedida']);
        if (array_key_exists('cantidadPendiente', $data))   $c->setCantidadPendiente($data['cantidadPendiente']);
        if (array_key_exists('fechaCaducidad', $data))      $c->setFechaCaducidad($data['fechaCaducidad'] ? new \DateTime($data['fechaCaducidad']) : null);
        if (array_key_exists('documentacion', $data))       $c->setDocumentacion($data['documentacion'] !== null ? (bool)$data['documentacion'] : null);
        if (array_key_exists('observaciones', $data))       $c->setObservaciones($data['observaciones']);
    }

    private function serialize(Contrato $c): array
    {
        return [
            'id'                => $c->getId(),
            'fecha'             => $c->getFecha()?->format('Y-m-d'),
            'numeroContrato'    => $c->getNumeroContrato(),
            'producto'          => $c->getProducto(),
            'proveedorId'       => $c->getProveedor()?->getId(),
            'proveedorNombre'   => $c->getProveedor()?->getNombre(),
            'precio'            => $c->getPrecio(),
            'grado'             => $c->getGrado(),
            'cantidad'          => $c->getCantidad(),
            'cantidadPedida'    => $c->getCantidadPedida(),
            'cantidadPendiente' => $c->getCantidadPendiente(),
            'fechaCaducidad'    => $c->getFechaCaducidad()?->format('Y-m-d'),
            'documentacion'     => $c->getDocumentacion(),
            'observaciones'     => $c->getObservaciones(),
        ];
    }
}

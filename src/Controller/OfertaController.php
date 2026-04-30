<?php

namespace App\Controller;

use App\Entity\Oferta;
use App\Repository\OfertaRepository;
use App\Repository\ProveedorRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/ofertas', name: 'api_oferta_')]
class OfertaController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(OfertaRepository $repo): JsonResponse
    {
        return $this->json(array_map(fn(Oferta $o) => $this->serialize($o), $repo->findAll()));
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(Oferta $oferta): JsonResponse
    {
        return $this->json($this->serialize($oferta));
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

        $oferta = new Oferta();
        $oferta->setProveedor($proveedor);
        $this->hydrate($oferta, $data);
        $em->persist($oferta);
        $em->flush();

        return $this->json($this->serialize($oferta), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(Oferta $oferta, Request $request, EntityManagerInterface $em, ProveedorRepository $proveedorRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!empty($data['proveedorId'])) {
            $proveedor = $proveedorRepo->find($data['proveedorId']);
            if (!$proveedor) {
                return $this->json(['error' => 'Proveedor no encontrado.'], Response::HTTP_NOT_FOUND);
            }
            $oferta->setProveedor($proveedor);
        }

        $this->hydrate($oferta, $data);
        $em->flush();

        return $this->json($this->serialize($oferta));
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(Oferta $oferta, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($oferta);
        $em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    private function hydrate(Oferta $o, array $data): void
    {
        if (array_key_exists('fecha', $data))         $o->setFecha($data['fecha'] ? new \DateTime($data['fecha']) : null);
        if (array_key_exists('producto', $data))      $o->setProducto($data['producto']);
        if (array_key_exists('grado', $data))         $o->setGrado($data['grado']);
        if (array_key_exists('cantidad', $data))      $o->setCantidad($data['cantidad']);
        if (array_key_exists('precio', $data))        $o->setPrecio($data['precio']);
        if (array_key_exists('moneda', $data))        $o->setMoneda($data['moneda']);
        if (array_key_exists('incoterm', $data))      $o->setIncoterm($data['incoterm']);
        if (array_key_exists('muestra', $data))       $o->setMuestra($data['muestra'] !== null ? (bool)$data['muestra'] : null);
        if (array_key_exists('tipo', $data))          $o->setTipo($data['tipo']);
        if (array_key_exists('documentacion', $data)) $o->setDocumentacion($data['documentacion'] !== null ? (bool)$data['documentacion'] : null);
        if (array_key_exists('observaciones', $data)) $o->setObservaciones($data['observaciones']);
    }

    private function serialize(Oferta $o): array
    {
        return [
            'id'             => $o->getId(),
            'fecha'          => $o->getFecha()?->format('Y-m-d'),
            'proveedorId'    => $o->getProveedor()?->getId(),
            'proveedorNombre'=> $o->getProveedor()?->getNombre(),
            'producto'       => $o->getProducto(),
            'grado'          => $o->getGrado(),
            'cantidad'       => $o->getCantidad(),
            'precio'         => $o->getPrecio(),
            'moneda'         => $o->getMoneda(),
            'incoterm'       => $o->getIncoterm(),
            'muestra'        => $o->getMuestra(),
            'tipo'           => $o->getTipo(),
            'documentacion'  => $o->getDocumentacion(),
            'observaciones'  => $o->getObservaciones(),
        ];
    }
}

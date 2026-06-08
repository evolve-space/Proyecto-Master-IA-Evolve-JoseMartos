<?php

namespace App\Controller;

use App\Entity\Importacion;
use App\Repository\ImportacionRepository;
use App\Repository\ProveedorRepository;
use App\Service\EntityFichaService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/importaciones', name: 'api_importacion_')]
class ImportacionController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(ImportacionRepository $repo): JsonResponse
    {
        return $this->json(array_map(fn(Importacion $i) => $this->serialize($i), $repo->findAll()));
    }

    #[Route('/{id}/ficha', name: 'ficha', methods: ['GET'])]
    public function ficha(Importacion $importacion, EntityFichaService $fichaService): JsonResponse
    {
        $ficha = $fichaService->forImportacion($importacion);

        return $this->json([
            'entity' => $this->serialize($importacion),
            'stats' => $ficha['stats'],
            'items' => $ficha['items'],
        ]);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(Importacion $importacion): JsonResponse
    {
        return $this->json($this->serialize($importacion));
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

        $importacion = new Importacion();
        $importacion->setProveedor($proveedor);
        $this->hydrate($importacion, $data);
        $em->persist($importacion);
        $em->flush();

        return $this->json($this->serialize($importacion), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(Importacion $importacion, Request $request, EntityManagerInterface $em, ProveedorRepository $proveedorRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!empty($data['proveedorId'])) {
            $proveedor = $proveedorRepo->find($data['proveedorId']);
            if (!$proveedor) {
                return $this->json(['error' => 'Proveedor no encontrado.'], Response::HTTP_NOT_FOUND);
            }
            $importacion->setProveedor($proveedor);
        }

        $this->hydrate($importacion, $data);
        $em->flush();

        return $this->json($this->serialize($importacion));
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(Importacion $importacion, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($importacion);
        $em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    private function hydrate(Importacion $i, array $data): void
    {
        if (array_key_exists('fechaDuaAlbaran', $data))  $i->setFechaDuaAlbaran($data['fechaDuaAlbaran'] ? new \DateTime($data['fechaDuaAlbaran']) : null);
        if (array_key_exists('fechaFactura', $data))     $i->setFechaFactura($data['fechaFactura'] ? new \DateTime($data['fechaFactura']) : null);
        if (array_key_exists('producto', $data))         $i->setProducto($data['producto']);
        if (array_key_exists('cantidad', $data))         $i->setCantidad($data['cantidad']);
        if (array_key_exists('importeEur', $data))       $i->setImporteEur($data['importeEur']);
        if (array_key_exists('aranceles', $data))        $i->setAranceles($data['aranceles']);
        if (array_key_exists('costeDespacho', $data))    $i->setCosteDespacho($data['costeDespacho']);
        if (array_key_exists('gastoImpKg', $data))       $i->setGastoImpKg($data['gastoImpKg']);
        if (array_key_exists('costeKg', $data))          $i->setCosteKg($data['costeKg']);
        if (array_key_exists('importeUsd', $data))       $i->setImporteUsd($data['importeUsd']);
        if (array_key_exists('tipoCambio', $data))       $i->setTipoCambio($data['tipoCambio']);
        if (array_key_exists('forwarderer', $data))      $i->setForwarderer($data['forwarderer']);
        if (array_key_exists('incoterm', $data))         $i->setIncoterm($data['incoterm']);
        if (array_key_exists('documentacion', $data))    $i->setDocumentacion($data['documentacion'] !== null ? (bool)$data['documentacion'] : null);
        if (array_key_exists('observaciones', $data))    $i->setObservaciones($data['observaciones']);
    }

    private function serialize(Importacion $i): array
    {
        return [
            'id'               => $i->getId(),
            'fechaDuaAlbaran'  => $i->getFechaDuaAlbaran()?->format('Y-m-d'),
            'fechaFactura'     => $i->getFechaFactura()?->format('Y-m-d'),
            'proveedorId'      => $i->getProveedor()?->getId(),
            'proveedorNombre'  => $i->getProveedor()?->getNombre(),
            'producto'         => $i->getProducto(),
            'cantidad'         => $i->getCantidad(),
            'importeEur'       => $i->getImporteEur(),
            'aranceles'        => $i->getAranceles(),
            'costeDespacho'    => $i->getCosteDespacho(),
            'gastoImpKg'       => $i->getGastoImpKg(),
            'costeKg'          => $i->getCosteKg(),
            'importeUsd'       => $i->getImporteUsd(),
            'tipoCambio'       => $i->getTipoCambio(),
            'forwarderer'      => $i->getForwarderer(),
            'incoterm'         => $i->getIncoterm(),
            'documentacion'    => $i->getDocumentacion(),
            'observaciones'    => $i->getObservaciones(),
        ];
    }
}

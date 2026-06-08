<?php

namespace App\Controller;

use App\Entity\Proveedor;
use App\Repository\ProveedorRepository;
use App\Service\ProveedorTimelineService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/proveedores', name: 'api_proveedor_')]
class ProveedorController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(ProveedorRepository $repo): JsonResponse
    {
        $proveedores = $repo->findAll();

        return $this->json(array_map(fn(Proveedor $p) => $this->serialize($p), $proveedores));
    }

    #[Route('/{id}/timeline', name: 'timeline', methods: ['GET'])]
    public function timeline(Proveedor $proveedor, Request $request, ProveedorTimelineService $timelineService): JsonResponse
    {
        $type = $request->query->get('type');
        $data = $timelineService->build($proveedor, $type);

        return $this->json([
            'proveedor' => $this->serialize($proveedor),
            'stats' => $data['stats'],
            'items' => $data['items'],
        ]);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(Proveedor $proveedor): JsonResponse
    {
        return $this->json($this->serialize($proveedor));
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['nombre'])) {
            return $this->json(['error' => 'El campo nombre es obligatorio.'], Response::HTTP_BAD_REQUEST);
        }

        $proveedor = new Proveedor();
        $this->hydrate($proveedor, $data);
        $em->persist($proveedor);
        $em->flush();

        return $this->json($this->serialize($proveedor), Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(Proveedor $proveedor, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $this->hydrate($proveedor, $data);
        $em->flush();

        return $this->json($this->serialize($proveedor));
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(Proveedor $proveedor, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($proveedor);
        $em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    private function hydrate(Proveedor $p, array $data): void
    {
        if (array_key_exists('nombre', $data))              $p->setNombre($data['nombre']);
        if (array_key_exists('cifNif', $data))              $p->setCifNif($data['cifNif']);
        if (array_key_exists('telefono', $data))            $p->setTelefono($data['telefono']);
        if (array_key_exists('web', $data))                 $p->setWeb($data['web']);
        if (array_key_exists('actividad', $data))           $p->setActividad($data['actividad']);
        if (array_key_exists('direccionFacturacion', $data)) $p->setDireccionFacturacion($data['direccionFacturacion']);
        if (array_key_exists('tipo', $data))                $p->setTipo($data['tipo']);
        if (array_key_exists('certificaciones', $data))     $p->setCertificaciones($data['certificaciones']);
        if (array_key_exists('contactoPrincipal', $data))   $p->setContactoPrincipal($data['contactoPrincipal']);
        if (array_key_exists('formaPago', $data))           $p->setFormaPago($data['formaPago'] !== null ? (int)$data['formaPago'] : null);
        if (array_key_exists('email', $data))               $p->setEmail($data['email']);
        if (array_key_exists('movil', $data))               $p->setMovil($data['movil']);
        if (array_key_exists('incoterm', $data))            $p->setIncoterm($data['incoterm']);
        if (array_key_exists('documentacion', $data))       $p->setDocumentacion($data['documentacion'] !== null ? (bool)$data['documentacion'] : null);
        if (array_key_exists('observaciones', $data))       $p->setObservaciones($data['observaciones']);
    }

    private function serialize(Proveedor $p): array
    {
        return [
            'id'                   => $p->getId(),
            'nombre'               => $p->getNombre(),
            'cifNif'               => $p->getCifNif(),
            'telefono'             => $p->getTelefono(),
            'web'                  => $p->getWeb(),
            'actividad'            => $p->getActividad(),
            'direccionFacturacion' => $p->getDireccionFacturacion(),
            'tipo'                 => $p->getTipo(),
            'certificaciones'      => $p->getCertificaciones(),
            'contactoPrincipal'    => $p->getContactoPrincipal(),
            'formaPago'            => $p->getFormaPago(),
            'email'                => $p->getEmail(),
            'movil'                => $p->getMovil(),
            'incoterm'             => $p->getIncoterm(),
            'documentacion'        => $p->getDocumentacion(),
            'observaciones'        => $p->getObservaciones(),
        ];
    }
}

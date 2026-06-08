<?php

namespace App\Service;

use App\Entity\CalendarEvent;
use App\Entity\Contrato;
use App\Entity\Email;
use App\Entity\Importacion;
use App\Entity\Muestra;
use App\Entity\Oferta;
use App\Entity\Proveedor;
use App\Repository\CalendarEventRepository;
use App\Repository\ContratoRepository;
use App\Repository\EmailRepository;
use App\Repository\ImportacionRepository;
use App\Repository\MuestraRepository;
use App\Repository\OfertaRepository;

class ProveedorTimelineService
{
    public function __construct(
        private readonly EmailRepository $emailRepository,
        private readonly CalendarEventRepository $calendarEventRepository,
        private readonly OfertaRepository $ofertaRepository,
        private readonly MuestraRepository $muestraRepository,
        private readonly ContratoRepository $contratoRepository,
        private readonly ImportacionRepository $importacionRepository,
    ) {
    }

    /**
     * @return array{stats: array<string, int>, items: list<array<string, mixed>>}
     */
    public function build(Proveedor $proveedor, ?string $type = null): array
    {
        $items = [];

        foreach ($this->emailRepository->findByProveedorOrdered($proveedor) as $email) {
            $items[] = $this->emailItem($email);
        }

        foreach ($this->calendarEventRepository->findByProveedorOrdered($proveedor) as $event) {
            $items[] = $this->eventItem($event);
        }

        foreach ($this->ofertaRepository->findBy(['proveedor' => $proveedor], ['fecha' => 'DESC']) as $oferta) {
            $items[] = $this->ofertaItem($oferta);
        }

        foreach ($this->muestraRepository->findBy(['proveedor' => $proveedor], ['fecha' => 'DESC']) as $muestra) {
            $items[] = $this->muestraItem($muestra);
        }

        foreach ($this->contratoRepository->findBy(['proveedor' => $proveedor], ['fecha' => 'DESC']) as $contrato) {
            $items[] = $this->contratoItem($contrato);
        }

        foreach ($this->importacionRepository->findBy(['proveedor' => $proveedor], ['fechaDuaAlbaran' => 'DESC']) as $importacion) {
            $items[] = $this->importacionItem($importacion);
        }

        usort($items, static fn (array $a, array $b) => strcmp($b['date'], $a['date']));

        if ($type !== null && $type !== '' && $type !== 'all') {
            $items = array_values(array_filter($items, static fn (array $i) => $i['type'] === $type));
        }

        $stats = [
            'emails' => \count($this->emailRepository->findByProveedorOrdered($proveedor)),
            'eventos' => \count($this->calendarEventRepository->findByProveedorOrdered($proveedor)),
            'ofertas' => \count($this->ofertaRepository->findBy(['proveedor' => $proveedor])),
            'muestras' => \count($this->muestraRepository->findBy(['proveedor' => $proveedor])),
            'contratos' => \count($this->contratoRepository->findBy(['proveedor' => $proveedor])),
            'importaciones' => \count($this->importacionRepository->findBy(['proveedor' => $proveedor])),
        ];

        return ['stats' => $stats, 'items' => $items];
    }

    private function emailItem(Email $email): array
    {
        return [
            'type' => 'email',
            'id' => $email->getId(),
            'date' => $email->getReceivedAt()->format(\DATE_ATOM),
            'title' => $email->getSubject() ?: '(Sin asunto)',
            'summary' => $email->getSender(),
            'meta' => [
                'status' => $email->getStatus(),
                'urgency' => $email->getUrgency(),
                'categoriaNombre' => $email->getCategoria()?->getNombre(),
                'categoriaColor' => $email->getCategoria()?->getColor(),
            ],
        ];
    }

    private function eventItem(CalendarEvent $event): array
    {
        return [
            'type' => 'evento',
            'id' => $event->getId(),
            'date' => $event->getStartAt()->format(\DATE_ATOM),
            'title' => $event->getSubject(),
            'summary' => $event->getLocation() ?? ($event->isAllDay() ? 'Todo el día' : ''),
            'meta' => [
                'urgency' => $event->getUrgency(),
                'categoriaNombre' => $event->getCategoria()?->getNombre(),
                'categoriaColor' => $event->getCategoria()?->getColor(),
                'emailId' => $event->getEmail()?->getId(),
            ],
        ];
    }

    private function ofertaItem(Oferta $oferta): array
    {
        return [
            'type' => 'oferta',
            'id' => $oferta->getId(),
            'date' => ($oferta->getFecha() ?? new \DateTimeImmutable())->format(\DATE_ATOM),
            'title' => $oferta->getProducto() ?? 'Oferta',
            'summary' => trim(sprintf(
                '%s %s · %s',
                $oferta->getPrecio() ?? '',
                $oferta->getMoneda() ?? '',
                $oferta->getTipo() ?? ''
            )),
            'meta' => [
                'cantidad' => $oferta->getCantidad(),
                'incoterm' => $oferta->getIncoterm(),
                'grado' => $oferta->getGrado(),
            ],
        ];
    }

    private function muestraItem(Muestra $muestra): array
    {
        return [
            'type' => 'muestra',
            'id' => $muestra->getId(),
            'date' => ($muestra->getFecha() ?? new \DateTimeImmutable())->format(\DATE_ATOM),
            'title' => $muestra->getProducto() ?? 'Muestra',
            'summary' => $muestra->getEstado() ?? '',
            'meta' => [
                'idLote' => $muestra->getIdLote(),
                'grado' => $muestra->getGrado(),
                'estado' => $muestra->getEstado(),
            ],
        ];
    }

    private function contratoItem(Contrato $contrato): array
    {
        return [
            'type' => 'contrato',
            'id' => $contrato->getId(),
            'date' => ($contrato->getFecha() ?? new \DateTimeImmutable())->format(\DATE_ATOM),
            'title' => $contrato->getNumeroContrato() ?? $contrato->getProducto() ?? 'Contrato',
            'summary' => $contrato->getProducto() ?? '',
            'meta' => [
                'fechaCaducidad' => $contrato->getFechaCaducidad()?->format('Y-m-d'),
                'cantidad' => $contrato->getCantidad(),
                'precio' => $contrato->getPrecio(),
            ],
        ];
    }

    private function importacionItem(Importacion $importacion): array
    {
        $date = $importacion->getFechaDuaAlbaran() ?? $importacion->getFechaFactura() ?? new \DateTimeImmutable();

        return [
            'type' => 'importacion',
            'id' => $importacion->getId(),
            'date' => $date->format(\DATE_ATOM),
            'title' => $importacion->getProducto() ?? 'Importación',
            'summary' => $importacion->getImporteEur() ? $importacion->getImporteEur() . ' EUR' : '',
            'meta' => [
                'cantidad' => $importacion->getCantidad(),
                'incoterm' => $importacion->getIncoterm(),
            ],
        ];
    }
}

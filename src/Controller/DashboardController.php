<?php

namespace App\Controller;

use App\Repository\CalendarEventRepository;
use App\Repository\ContratoRepository;
use App\Repository\EmailRepository;
use App\Repository\MuestraRepository;
use App\Repository\ProveedorRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class DashboardController extends AbstractController
{
    #[Route('/api/dashboard/alerts', name: 'api_dashboard_alerts', methods: ['GET'])]
    public function alerts(
        ContratoRepository $contratoRepository,
        MuestraRepository $muestraRepository,
        ProveedorRepository $proveedorRepository,
        EmailRepository $emailRepository,
        CalendarEventRepository $calendarEventRepository,
    ): JsonResponse {
        $now = new \DateTimeImmutable();
        $in30 = $now->modify('+30 days');
        $in7 = $now->modify('+7 days');
        $in24h = $now->modify('+24 hours');

        $alerts = [];

        $contratosProxVencer = array_filter(
            $contratoRepository->findAll(),
            static function ($c) use ($now, $in30) {
                $cad = $c->getFechaCaducidad();
                if ($cad === null) {
                    return false;
                }
                $d = \DateTimeImmutable::createFromMutable($cad);

                return $d >= $now && $d <= $in30;
            }
        );
        $nContratos = \count($contratosProxVencer);
        if ($nContratos > 0) {
            $alerts[] = [
                'type' => 'warning',
                'category' => 'contrato',
                'text' => sprintf(
                    '%d contrato%s próximo%s a vencer (< 30 días)',
                    $nContratos,
                    $nContratos > 1 ? 's' : '',
                    $nContratos > 1 ? 's' : ''
                ),
                'link' => '/contratos',
                'count' => $nContratos,
            ];
        }

        $muestrasPendientes = $muestraRepository->findBy(['estado' => 'Pendiente']);
        $nMuestras = \count($muestrasPendientes);
        if ($nMuestras > 0) {
            $alerts[] = [
                'type' => 'info',
                'category' => 'muestra',
                'text' => sprintf(
                    '%d muestra%s pendiente%s de revisión',
                    $nMuestras,
                    $nMuestras > 1 ? 's' : '',
                    $nMuestras > 1 ? 's' : ''
                ),
                'link' => '/muestras',
                'count' => $nMuestras,
            ];
        }

        $sinDoc = array_filter($proveedorRepository->findAll(), static fn ($p) => !$p->getDocumentacion());
        $nSinDoc = \count($sinDoc);
        if ($nSinDoc > 0) {
            $alerts[] = [
                'type' => 'warning',
                'category' => 'proveedor',
                'text' => sprintf(
                    '%d proveedor%s sin documentación completa',
                    $nSinDoc,
                    $nSinDoc > 1 ? 'es' : ''
                ),
                'link' => '/proveedores',
                'count' => $nSinDoc,
            ];
        }

        $emailsUrgentes = array_filter(
            $emailRepository->findAllOrdered(),
            static fn ($e) => $e->getUrgency() === 'alta' && \in_array($e->getStatus(), ['pending', 'read'], true)
        );
        $nUrgentes = \count($emailsUrgentes);
        if ($nUrgentes > 0) {
            $alerts[] = [
                'type' => 'warning',
                'category' => 'email',
                'text' => sprintf('%d correo%s urgente%s sin cerrar', $nUrgentes, $nUrgentes > 1 ? 's' : '', $nUrgentes > 1 ? 's' : ''),
                'link' => '/correos',
                'count' => $nUrgentes,
            ];
        }

        $eventosProximos = $calendarEventRepository->findInRange($now, $in7);
        $nEventos = \count($eventosProximos);
        if ($nEventos > 0) {
            $alerts[] = [
                'type' => 'info',
                'category' => 'calendario',
                'text' => sprintf('%d evento%s en los próximos 7 días', $nEventos, $nEventos > 1 ? 's' : ''),
                'link' => '/calendario',
                'count' => $nEventos,
            ];
        }

        $eventosUrgentes = array_filter($eventosProximos, static fn ($e) => $e->getUrgency() === 'alta');
        $nEvUrg = \count($eventosUrgentes);
        if ($nEvUrg > 0) {
            $alerts[] = [
                'type' => 'warning',
                'category' => 'calendario',
                'text' => sprintf('%d evento%s urgente%s esta semana', $nEvUrg, $nEvUrg > 1 ? 's' : '', $nEvUrg > 1 ? 's' : ''),
                'link' => '/calendario',
                'count' => $nEvUrg,
            ];
        }

        $eventos24h = array_filter(
            $eventosProximos,
            static fn ($e) => $e->getStartAt() <= $in24h
        );

        $upcomingEvents = array_map(static function ($e) {
            return [
                'id' => $e->getId(),
                'subject' => $e->getSubject(),
                'startAt' => $e->getStartAt()->format(\DATE_ATOM),
                'endAt' => $e->getEndAt()->format(\DATE_ATOM),
                'allDay' => $e->isAllDay(),
                'urgency' => $e->getUrgency(),
                'proveedorNombre' => $e->getProveedor()?->getNombre(),
                'categoriaNombre' => $e->getCategoria()?->getNombre(),
                'categoriaColor' => $e->getCategoria()?->getColor(),
            ];
        }, array_values($eventosProximos));

        if ($alerts === []) {
            $alerts[] = [
                'type' => 'ok',
                'category' => 'system',
                'text' => 'Todo en orden — sin alertas pendientes.',
                'link' => '/',
                'count' => 0,
            ];
        }

        return $this->json([
            'alerts' => $alerts,
            'upcomingEvents' => $upcomingEvents,
            'eventsNext24h' => \count($eventos24h),
        ]);
    }
}

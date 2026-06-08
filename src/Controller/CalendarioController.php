<?php

namespace App\Controller;

use App\Entity\CalendarEvent;
use App\Entity\Email;
use App\Entity\Proveedor;
use App\Repository\CalendarioCategoriaRepository;
use App\Repository\CalendarEventRepository;
use App\Repository\EmailRepository;
use App\Repository\ProveedorRepository;
use App\Service\CalendarGraphSyncService;
use App\Service\EmailClassificationService;
use App\Service\MicrosoftGraphCalendarService;
use App\Service\MicrosoftGraphOAuthService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class CalendarioController extends AbstractController
{
    #[Route('/api/calendario/eventos', name: 'api_calendario_list', methods: ['GET'])]
    public function list(Request $request, CalendarEventRepository $repository): JsonResponse
    {
        [$from, $to] = $this->parseRange($request);
        $events = $repository->findInRange($from, $to);

        return $this->json(array_map(fn (CalendarEvent $e) => $this->serialize($e), $events));
    }

    #[Route('/api/calendario/eventos/{id}', name: 'api_calendario_get', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function getOne(CalendarEvent $event): JsonResponse
    {
        return $this->json($this->serialize($event));
    }

    #[Route('/api/calendario/eventos', name: 'api_calendario_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        EmailRepository $emailRepository,
        ProveedorRepository $proveedorRepository,
        CalendarioCategoriaRepository $categoriaRepository,
        EmailClassificationService $classificationService,
        MicrosoftGraphCalendarService $graphCalendarService,
        MicrosoftGraphOAuthService $oauthService,
    ): JsonResponse {
        $data = $this->decodeJson($request);
        $subject = trim((string) ($data['subject'] ?? ''));
        if ($subject === '') {
            return $this->json(['error' => 'El asunto es obligatorio.'], 400);
        }

        try {
            [$start, $end] = $this->parseEventDates($data);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }

        if ($end <= $start) {
            return $this->json(['error' => 'La fecha de fin debe ser posterior al inicio.'], 400);
        }

        $allDay = (bool) ($data['allDay'] ?? false);
        $description = isset($data['description']) ? trim((string) $data['description']) : null;
        $location = isset($data['location']) ? trim((string) $data['location']) : null;
        $pushOutlook = (bool) ($data['pushOutlook'] ?? true);

        $event = new CalendarEvent();
        $event
            ->setSubject($subject)
            ->setDescription($description !== '' ? $description : null)
            ->setLocation($location !== '' ? $location : null)
            ->setStartAt($start)
            ->setEndAt($end)
            ->setAllDay($allDay)
            ->setSource(CalendarEvent::SOURCE_LOCAL);

        try {
            $this->applyRelations($event, $data, $emailRepository, $proveedorRepository, $categoriaRepository);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }

        $linkedEmail = $event->getEmail();
        if ($linkedEmail instanceof Email) {
            if ($linkedEmail->getClassificationSource() === null) {
                $classificationService->classifyAndApply($linkedEmail);
            }
            $classificationService->copyClassificationToCalendarEvent($event, $linkedEmail, $categoriaRepository);
        }

        if ($pushOutlook && $oauthService->hasConnection()) {
            try {
                $payload = $graphCalendarService->buildCreatePayload(
                    $subject,
                    $start,
                    $end,
                    $allDay,
                    $description,
                    $location,
                );
                $graph = $graphCalendarService->createEvent($payload);
                $event
                    ->setGraphEventId((string) ($graph['id'] ?? ''))
                    ->setSource(CalendarEvent::SOURCE_OUTLOOK)
                    ->setWebLink(isset($graph['webLink']) ? (string) $graph['webLink'] : null);
            } catch (\Throwable $e) {
                return $this->json(['error' => 'No se pudo crear en Outlook: '.$e->getMessage()], 502);
            }
        }

        $em->persist($event);
        $em->flush();

        return $this->json($this->serialize($event), 201);
    }

    #[Route('/api/calendario/eventos/desde-email/{id}', name: 'api_calendario_from_email', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function createFromEmail(
        Email $email,
        Request $request,
        EntityManagerInterface $em,
        CalendarioCategoriaRepository $categoriaRepository,
        EmailClassificationService $classificationService,
        MicrosoftGraphCalendarService $graphCalendarService,
        MicrosoftGraphOAuthService $oauthService,
    ): JsonResponse {
        $data = $this->decodeJson($request);

        if ($email->getClassificationSource() === null) {
            $classificationService->classifyAndApply($email);
        }

        try {
            [$start, $end] = $this->parseEventDates($data);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }

        if ($end <= $start) {
            return $this->json(['error' => 'La fecha de fin debe ser posterior al inicio.'], 400);
        }

        $subject = trim((string) ($data['subject'] ?? $email->getSubject()));
        $description = trim((string) ($data['description'] ?? $email->getBody()));
        $allDay = (bool) ($data['allDay'] ?? false);
        $pushOutlook = (bool) ($data['pushOutlook'] ?? true);

        $event = new CalendarEvent();
        $event
            ->setSubject($subject !== '' ? $subject : 'Seguimiento correo')
            ->setDescription($description !== '' ? $description : null)
            ->setStartAt($start)
            ->setEndAt($end)
            ->setAllDay($allDay)
            ->setEmail($email)
            ->setProveedor($email->getProveedor())
            ->setSource(CalendarEvent::SOURCE_LOCAL);

        try {
            $this->applyRelations($event, $data, null, null, $categoriaRepository);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }

        $classificationService->copyClassificationToCalendarEvent($event, $email, $categoriaRepository);

        if ($pushOutlook && $oauthService->hasConnection()) {
            try {
                $payload = $graphCalendarService->buildCreatePayload(
                    $event->getSubject(),
                    $start,
                    $end,
                    $allDay,
                    $description,
                    null,
                );
                $graph = $graphCalendarService->createEvent($payload);
                $event
                    ->setGraphEventId((string) ($graph['id'] ?? ''))
                    ->setSource(CalendarEvent::SOURCE_OUTLOOK)
                    ->setWebLink(isset($graph['webLink']) ? (string) $graph['webLink'] : null);
            } catch (\Throwable $e) {
                return $this->json(['error' => 'No se pudo crear en Outlook: '.$e->getMessage()], 502);
            }
        }

        $em->persist($event);
        $em->flush();

        return $this->json($this->serialize($event), 201);
    }

    #[Route('/api/calendario/eventos/{id}', name: 'api_calendario_update', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function update(
        CalendarEvent $event,
        Request $request,
        EntityManagerInterface $em,
        EmailRepository $emailRepository,
        ProveedorRepository $proveedorRepository,
        CalendarioCategoriaRepository $categoriaRepository,
        MicrosoftGraphCalendarService $graphCalendarService,
        MicrosoftGraphOAuthService $oauthService,
    ): JsonResponse {
        $data = $this->decodeJson($request);

        if (array_key_exists('subject', $data)) {
            $subject = trim((string) $data['subject']);
            if ($subject === '') {
                return $this->json(['error' => 'El asunto no puede estar vacío.'], 400);
            }
            $event->setSubject($subject);
        }

        if (array_key_exists('description', $data)) {
            $description = trim((string) $data['description']);
            $event->setDescription($description !== '' ? $description : null);
        }

        if (array_key_exists('location', $data)) {
            $location = trim((string) $data['location']);
            $event->setLocation($location !== '' ? $location : null);
        }

        if (array_key_exists('allDay', $data)) {
            $event->setAllDay((bool) $data['allDay']);
        }

        if (array_key_exists('startAt', $data) || array_key_exists('endAt', $data)) {
            try {
                [$start, $end] = $this->parseEventDates([
                    'startAt' => $data['startAt'] ?? $event->getStartAt()->format(\DATE_ATOM),
                    'endAt' => $data['endAt'] ?? $event->getEndAt()->format(\DATE_ATOM),
                    'allDay' => $event->isAllDay(),
                ]);
            } catch (\InvalidArgumentException $e) {
                return $this->json(['error' => $e->getMessage()], 400);
            }

            if ($end <= $start) {
                return $this->json(['error' => 'La fecha de fin debe ser posterior al inicio.'], 400);
            }

            $event->setStartAt($start)->setEndAt($end);
        }

        try {
            $this->applyRelations($event, $data, $emailRepository, $proveedorRepository, $categoriaRepository);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }
        $event->touch();

        $graphId = $event->getGraphEventId();
        if ($graphId !== null && $graphId !== '' && $oauthService->hasConnection()) {
            try {
                $payload = $graphCalendarService->buildCreatePayload(
                    $event->getSubject(),
                    $event->getStartAt(),
                    $event->getEndAt(),
                    $event->isAllDay(),
                    $event->getDescription(),
                    $event->getLocation(),
                );
                $graphCalendarService->updateEvent($graphId, $payload);
            } catch (\Throwable $e) {
                return $this->json(['error' => 'No se pudo actualizar en Outlook: '.$e->getMessage()], 502);
            }
        }

        $em->flush();

        return $this->json($this->serialize($event));
    }

    #[Route('/api/calendario/eventos/{id}', name: 'api_calendario_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(
        CalendarEvent $event,
        EntityManagerInterface $em,
        MicrosoftGraphCalendarService $graphCalendarService,
        MicrosoftGraphOAuthService $oauthService,
    ): JsonResponse {
        $graphId = $event->getGraphEventId();
        if ($graphId !== null && $graphId !== '' && $oauthService->hasConnection()) {
            try {
                $graphCalendarService->deleteEvent($graphId);
            } catch (\Throwable $e) {
                return $this->json(['error' => 'No se pudo eliminar en Outlook: '.$e->getMessage()], 502);
            }
        }

        $em->remove($event);
        $em->flush();

        return $this->json(null, 204);
    }

    #[Route('/api/calendario/sync', name: 'api_calendario_sync', methods: ['POST'])]
    public function sync(Request $request, CalendarGraphSyncService $syncService): JsonResponse
    {
        $data = $this->decodeJson($request);
        $from = isset($data['from']) ? $this->parseDate((string) $data['from']) : new \DateTimeImmutable('first day of this month 00:00:00');
        $to = isset($data['to']) ? $this->parseDate((string) $data['to']) : $from->modify('+2 months');

        try {
            $result = $syncService->sync($from, $to);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 502);
        }

        return $this->json([
            'imported' => $result['imported'],
            'updated' => $result['updated'],
            'fetched' => $result['fetched'],
            'events' => array_map(fn (CalendarEvent $e) => $this->serialize($e), $result['events']),
        ]);
    }

    /**
     * @return array{0: \DateTimeImmutable, 1: \DateTimeImmutable}
     */
    private function parseRange(Request $request): array
    {
        $fromParam = $request->query->get('from');
        $toParam = $request->query->get('to');

        if (is_string($fromParam) && $fromParam !== '' && is_string($toParam) && $toParam !== '') {
            return [$this->parseDate($fromParam), $this->parseDate($toParam)];
        }

        $now = new \DateTimeImmutable();
        $from = $now->modify('first day of this month')->setTime(0, 0, 0);
        $to = $from->modify('+2 months');

        return [$from, $to];
    }

    /**
     * @return array{0: \DateTimeImmutable, 1: \DateTimeImmutable}
     */
    private function parseEventDates(array $data): array
    {
        $startRaw = (string) ($data['startAt'] ?? '');
        $endRaw = (string) ($data['endAt'] ?? '');

        if ($startRaw === '' || $endRaw === '') {
            throw new \InvalidArgumentException('startAt y endAt son obligatorios.');
        }

        return [$this->parseDate($startRaw), $this->parseDate($endRaw)];
    }

    private function parseDate(string $value): \DateTimeImmutable
    {
        try {
            return new \DateTimeImmutable($value);
        } catch (\Throwable) {
            throw new \InvalidArgumentException('Fecha inválida: '.$value);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function decodeJson(Request $request): array
    {
        $data = json_decode($request->getContent(), true);

        return is_array($data) ? $data : [];
    }

    /**
     * @param array<string, mixed> $data
     */
    private function applyRelations(
        CalendarEvent $event,
        array $data,
        ?EmailRepository $emailRepository,
        ?ProveedorRepository $proveedorRepository,
        CalendarioCategoriaRepository $categoriaRepository,
    ): void {
        if ($emailRepository !== null && array_key_exists('emailId', $data)) {
            $emailId = $data['emailId'];
            if ($emailId === null || $emailId === '') {
                $event->setEmail(null);
            } else {
                $email = $emailRepository->find((int) $emailId);
                if (!$email instanceof Email) {
                    throw new \InvalidArgumentException('Correo no encontrado.');
                }
                $event->setEmail($email);
                if ($event->getProveedor() === null && $email->getProveedor() !== null) {
                    $event->setProveedor($email->getProveedor());
                }
            }
        }

        if ($proveedorRepository !== null && array_key_exists('proveedorId', $data)) {
            $proveedorId = $data['proveedorId'];
            if ($proveedorId === null || $proveedorId === '') {
                $event->setProveedor(null);
            } else {
                $proveedor = $proveedorRepository->find((int) $proveedorId);
                if (!$proveedor instanceof Proveedor) {
                    throw new \InvalidArgumentException('Proveedor no encontrado.');
                }
                $event->setProveedor($proveedor);
            }
        }

        if (array_key_exists('urgency', $data)) {
            $event->setUrgency((string) $data['urgency']);
        }

        if (array_key_exists('categoriaId', $data)) {
            $categoriaId = $data['categoriaId'];
            if ($categoriaId === null || $categoriaId === '') {
                $event->setCategoria(null);
            } else {
                $categoria = $categoriaRepository->find((int) $categoriaId);
                if ($categoria === null) {
                    throw new \InvalidArgumentException('Categoría no encontrada.');
                }
                $event->setCategoria($categoria);
            }
        }
    }

    private function serialize(CalendarEvent $event): array
    {
        return [
            'id' => $event->getId(),
            'graphEventId' => $event->getGraphEventId(),
            'subject' => $event->getSubject(),
            'description' => $event->getDescription(),
            'location' => $event->getLocation(),
            'startAt' => $event->getStartAt()->format(\DATE_ATOM),
            'endAt' => $event->getEndAt()->format(\DATE_ATOM),
            'allDay' => $event->isAllDay(),
            'organizer' => $event->getOrganizer(),
            'attendees' => $event->getAttendees() ?? [],
            'source' => $event->getSource(),
            'webLink' => $event->getWebLink(),
            'emailId' => $event->getEmail()?->getId(),
            'emailSubject' => $event->getEmail()?->getSubject(),
            'proveedorId' => $event->getProveedor()?->getId(),
            'proveedorNombre' => $event->getProveedor()?->getNombre(),
            'categoriaId' => $event->getCategoria()?->getId(),
            'categoriaNombre' => $event->getCategoria()?->getNombre(),
            'categoriaColor' => $event->getCategoria()?->getColor(),
            'urgency' => $event->getUrgency(),
            'importacionId' => $event->getImportacion()?->getId(),
            'importacionProducto' => $event->getImportacion()?->getProducto(),
            'muestraId' => $event->getMuestra()?->getId(),
            'muestraProducto' => $event->getMuestra()?->getProducto(),
            'ofertaId' => $event->getOferta()?->getId(),
            'ofertaProducto' => $event->getOferta()?->getProducto(),
            'contratoId' => $event->getContrato()?->getId(),
            'contratoNumero' => $event->getContrato()?->getNumeroContrato(),
            'createdAt' => $event->getCreatedAt()->format(\DATE_ATOM),
            'updatedAt' => $event->getUpdatedAt()->format(\DATE_ATOM),
        ];
    }
}

<?php

namespace App\Controller;

use App\Entity\Email;
use App\Entity\EmailExclusion;
use App\Entity\Muestra;
use App\Entity\Oferta;
use App\Entity\Proveedor;
use App\Repository\EmailCategoriaRepository;
use App\Repository\EmailExclusionRepository;
use App\Repository\EmailRepository;
use App\Repository\ProveedorRepository;
use App\Repository\UsuarioRepository;
use App\Service\EmailClassificationService;
use App\Service\EmailGraphSyncService;
use App\Service\EmailImportService;
use App\Service\MicrosoftGraphMailService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;

class EmailController extends AbstractController
{
    #[Route('/api/emails/incoming', name: 'api_email_incoming_webhook', methods: ['POST'])]
    public function incoming(
        Request $request,
        EmailImportService $importService,
        EmailRepository $emailRepository,
    ): JsonResponse {
        $webhookSecret = trim((string) ($_ENV['EMAIL_WEBHOOK_SECRET'] ?? ''));
        if ($webhookSecret === '') {
            return $this->json(['error' => 'EMAIL_WEBHOOK_SECRET no configurado en el servidor.'], 503);
        }

        $provided = $request->headers->get('X-Webhook-Secret', '');
        if ($provided === '' || !hash_equals($webhookSecret, $provided)) {
            return $this->json(['error' => 'No autorizado.'], 401);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalido.'], 400);
        }

        $items = $data['items'] ?? [$data];
        if (!is_array($items)) {
            return $this->json(['error' => 'Se esperaba un objeto de correo o { items: [...] }.'], 400);
        }

        try {
            if (count($items) === 1 && is_array($items[0])) {
                $payload = $items[0];
                $existing = $emailRepository->findOneByMessageId((string) ($payload['messageId'] ?? ''));
                $email = $importService->import($payload);

                return $this->json(
                    [
                        'email' => $this->serialize($email),
                        'duplicated' => $existing instanceof Email,
                    ],
                    $existing instanceof Email ? 200 : 201,
                );
            }

            $result = $importService->importBulk($items);

            return $this->json(
                [
                    'emails' => array_map(fn (Email $email) => $this->serialize($email), $result['emails']),
                    'imported' => $result['imported'],
                    'duplicated' => $result['duplicated'],
                    'failed' => $result['failed'],
                    'errors' => $result['errors'],
                ],
                $result['imported'] > 0 ? 201 : 200,
            );
        } catch (\InvalidArgumentException $exception) {
            return $this->json(['error' => $exception->getMessage()], 400);
        }
    }

    #[Route('/api/emails', name: 'api_email_list', methods: ['GET'])]
    public function list(EmailRepository $emailRepository): JsonResponse
    {
        $emails = $emailRepository->findAllOrdered();

        return $this->json(array_map(fn (Email $email) => $this->serialize($email), $emails));
    }

    #[Route('/api/emails/sync', name: 'api_email_sync', methods: ['POST'])]
    public function sync(Request $request, EmailGraphSyncService $syncService): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        if (!is_array($payload)) {
            $payload = [];
        }

        $all = (bool) ($payload['all'] ?? true);
        $top = (int) ($payload['top'] ?? 50);
        $includeAttachments = (bool) ($payload['includeAttachments'] ?? false);
        $includeEmails = (bool) ($payload['includeEmails'] ?? false);

        try {
            $result = $syncService->sync($all, $top, $includeAttachments);

            $response = [
                'all' => $all,
                'fetched' => $result['fetched'],
                'imported' => $result['imported'],
                'duplicated' => $result['duplicated'],
                'failed' => $result['failed'],
                'errors' => $result['errors'],
            ];

            if ($includeEmails) {
                $response['emails'] = array_map(
                    fn (Email $email) => $this->serialize($email),
                    $result['emails'],
                );
            }

            return $this->json($response);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/api/emails/bulk', name: 'api_email_bulk_create', methods: ['POST'])]
    public function bulkCreate(Request $request, EmailImportService $importService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalido.'], 400);
        }

        $items = $data['items'] ?? $data;
        if (!is_array($items)) {
            return $this->json(['error' => 'Se esperaba un array de correos.'], 400);
        }

        $result = $importService->importBulk($items);

        return $this->json([
            'emails' => array_map(fn (Email $email) => $this->serialize($email), $result['emails']),
            'imported' => $result['imported'],
            'duplicated' => $result['duplicated'],
            'failed' => $result['failed'],
            'errors' => $result['errors'],
        ], 201);
    }

    #[Route('/api/emails/{id}', name: 'api_email_show', methods: ['GET'])]
    public function show(
        Email $email,
        Request $request,
        MicrosoftGraphMailService $graphMailService,
        EntityManagerInterface $em,
    ): JsonResponse {
        $refresh = filter_var($request->query->get('refresh', false), FILTER_VALIDATE_BOOL);

        if ($refresh) {
            try {
                $email = $this->hydrateEmailFromGraph($email, $graphMailService, $em);
            } catch (\Throwable $e) {
                return $this->json(['error' => $e->getMessage()], 500);
            }
        }

        return $this->json($this->serialize($email));
    }

    #[Route('/api/emails/{id}/refresh', name: 'api_email_refresh', methods: ['POST'])]
    public function refresh(
        Email $email,
        MicrosoftGraphMailService $graphMailService,
        EntityManagerInterface $em,
    ): JsonResponse {
        try {
            $email = $this->hydrateEmailFromGraph($email, $graphMailService, $em);

            return $this->json($this->serialize($email));
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/api/emails/{id}/classify', name: 'api_email_classify', methods: ['POST'])]
    public function classify(Email $email, EmailClassificationService $classificationService): JsonResponse
    {
        try {
            $result = $classificationService->classifyAndApply($email, true);

            return $this->json([
                'email' => $this->serialize($email),
                'classification' => $result->toArray(),
            ]);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/api/emails/classify-pending', name: 'api_email_classify_pending', methods: ['POST'])]
    public function classifyPending(
        EmailRepository $emailRepository,
        EmailClassificationService $classificationService,
    ): JsonResponse {
        $emails = $emailRepository->findAllOrdered();
        $classified = 0;
        $errors = [];

        foreach ($emails as $email) {
            if ($email->getClassificationSource() !== null) {
                continue;
            }
            try {
                $classificationService->classifyAndApply($email);
                ++$classified;
            } catch (\Throwable $e) {
                $errors[] = ['id' => $email->getId(), 'error' => $e->getMessage()];
            }
        }

        return $this->json([
            'classified' => $classified,
            'errors' => $errors,
        ]);
    }

    #[Route('/api/emails/{id}/ofertas', name: 'api_email_create_oferta', methods: ['POST'])]
    public function createOfertaFromEmail(
        Email $email,
        Request $request,
        EntityManagerInterface $em,
        ProveedorRepository $proveedorRepo,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];
        $proveedorId = $data['proveedorId'] ?? $email->getProveedor()?->getId();

        if (empty($proveedorId)) {
            return $this->json(['error' => 'Selecciona un proveedor o vincula el correo a uno.'], Response::HTTP_BAD_REQUEST);
        }

        $proveedor = $proveedorRepo->find($proveedorId);
        if (!$proveedor) {
            return $this->json(['error' => 'Proveedor no encontrado.'], Response::HTTP_NOT_FOUND);
        }

        $oferta = new Oferta();
        $oferta->setProveedor($proveedor);

        if (empty($data['fecha'])) {
            $oferta->setFecha(\DateTime::createFromImmutable($email->getReceivedAt()));
        }

        $this->hydrateOfertaFromRequest($oferta, $data);

        if (!$oferta->getProducto() && $email->getSubject() !== '') {
            $oferta->setProducto($this->cleanEmailSubject($email->getSubject()));
        }

        $email->setOferta($oferta);
        if (!$email->getProveedor()) {
            $email->setProveedor($proveedor);
        }

        $em->persist($oferta);
        $em->flush();

        return $this->json([
            'oferta' => $this->serializeOfertaBrief($oferta),
            'email' => $this->serialize($email),
        ], Response::HTTP_CREATED);
    }

    #[Route('/api/emails/{id}/muestras', name: 'api_email_create_muestra', methods: ['POST'])]
    public function createMuestraFromEmail(
        Email $email,
        Request $request,
        EntityManagerInterface $em,
        ProveedorRepository $proveedorRepo,
        UsuarioRepository $usuarioRepo,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];
        $proveedorId = $data['proveedorId'] ?? $email->getProveedor()?->getId();

        if (empty($proveedorId)) {
            return $this->json(['error' => 'Selecciona un proveedor o vincula el correo a uno.'], Response::HTTP_BAD_REQUEST);
        }

        $proveedor = $proveedorRepo->find($proveedorId);
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

        if (empty($data['fecha'])) {
            $muestra->setFecha(\DateTime::createFromImmutable($email->getReceivedAt()));
        }

        $this->hydrateMuestraFromRequest($muestra, $data);

        if (!$muestra->getProducto() && $email->getSubject() !== '') {
            $muestra->setProducto($this->cleanEmailSubject($email->getSubject()));
        }

        $email->setMuestra($muestra);
        if (!$email->getProveedor()) {
            $email->setProveedor($proveedor);
        }

        $em->persist($muestra);
        $em->flush();

        return $this->json([
            'muestra' => $this->serializeMuestraBrief($muestra),
            'email' => $this->serialize($email),
        ], Response::HTTP_CREATED);
    }

    #[Route('/api/emails/{id}', name: 'api_email_update', methods: ['PATCH'])]
    public function update(
        Email $email,
        Request $request,
        EntityManagerInterface $em,
        EmailCategoriaRepository $categoriaRepository,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalido.'], 400);
        }

        if (array_key_exists('status', $data)) {
            try {
                $email->setStatus((string) $data['status']);
            } catch (\InvalidArgumentException $exception) {
                return $this->json(['error' => $exception->getMessage()], 400);
            }
        }

        if (array_key_exists('categoriaId', $data)) {
            $categoriaId = $data['categoriaId'];
            if ($categoriaId === null || $categoriaId === '') {
                $email->setCategoria(null);
            } else {
                $categoria = $categoriaRepository->find((int) $categoriaId);
                if ($categoria === null) {
                    return $this->json(['error' => 'Categoria no encontrada.'], 404);
                }
                $email->setCategoria($categoria);
            }
        }

        $em->flush();

        return $this->json($this->serialize($email));
    }

    #[Route('/api/emails/{id}/reply', name: 'api_email_reply', methods: ['POST'])]
    public function reply(
        Email $email,
        Request $request,
        MicrosoftGraphMailService $graphMailService,
        EntityManagerInterface $em,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalido.'], 400);
        }

        $body = (string) ($data['body'] ?? '');
        if (trim($body) === '') {
            return $this->json(['error' => 'El mensaje es obligatorio.'], 400);
        }

        $replyAll = (bool) ($data['replyAll'] ?? false);
        $attachments = $graphMailService->normalizeOutgoingAttachments(
            is_array($data['attachments'] ?? null) ? $data['attachments'] : [],
        );

        try {
            $graphMailService->replyToMessage($email->getMessageId(), $body, $replyAll, $attachments);
            if ($email->getStatus() !== Email::STATUS_REPLIED) {
                $email->setStatus(Email::STATUS_REPLIED);
                $em->flush();
            }

            return $this->json([
                'ok' => true,
                'message' => 'Respuesta enviada.',
                'email' => $this->serialize($email),
            ]);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/api/emails/{id}', name: 'api_email_delete', methods: ['DELETE'])]
    public function delete(
        Email $email,
        EntityManagerInterface $em,
        EmailExclusionRepository $exclusionRepository,
    ): JsonResponse {
        $messageId = trim($email->getMessageId());
        if ($messageId !== '' && !$exclusionRepository->existsByMessageId($messageId)) {
            $em->persist(new EmailExclusion($messageId));
        }

        $em->remove($email);
        $em->flush();

        return $this->json(null, 204);
    }

    #[Route('/api/proveedores/{id}/emails', name: 'api_proveedor_emails_list', methods: ['GET'])]
    public function listByProveedor(Proveedor $proveedor, EmailRepository $emailRepository): JsonResponse
    {
        $emails = $emailRepository->findByProveedorOrdered($proveedor);

        return $this->json(array_map(fn (Email $email) => $this->serialize($email), $emails));
    }

    #[Route('/api/emails/{id}/attachments/sync', name: 'api_email_attachments_sync', methods: ['POST'])]
    public function syncAttachments(
        Email $email,
        MicrosoftGraphMailService $graphMailService,
        EntityManagerInterface $em,
    ): JsonResponse {
        try {
            $this->refreshAttachmentsFromGraph($email, $graphMailService);
            $em->flush();

            return $this->json([
                'hasAttachments' => $email->hasAttachments(),
                'attachments' => $email->getAttachments() ?? [],
                'email' => $this->serialize($email),
            ]);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    #[Route(
        '/api/emails/{id}/attachments/{attachmentId}/download',
        name: 'api_email_attachment_download',
        methods: ['GET'],
        requirements: ['attachmentId' => '.+'],
    )]
    public function downloadAttachment(
        Email $email,
        string $attachmentId,
        MicrosoftGraphMailService $graphMailService,
    ): BinaryFileResponse|JsonResponse {
        try {
            $file = $graphMailService->downloadAttachment($email->getMessageId(), $attachmentId);
            $temp = tempnam(sys_get_temp_dir(), 'mail_att_');
            if ($temp === false) {
                throw new \RuntimeException('No se pudo crear archivo temporal.');
            }
            file_put_contents($temp, $file['content']);

            $response = new BinaryFileResponse($temp);
            $response->setContentDisposition(
                ResponseHeaderBag::DISPOSITION_ATTACHMENT,
                (string) $file['fileName'],
            );
            $response->headers->set('Content-Type', (string) $file['contentType']);
            $response->deleteFileAfterSend(true);

            return $response;
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function hydrateEmailFromGraph(
        Email $email,
        MicrosoftGraphMailService $graphMailService,
        EntityManagerInterface $em,
    ): Email {
        $message = $graphMailService->getMessage($email->getMessageId());
        $email->setBody($graphMailService->extractBodyText($message));
        $email->setSubject((string) ($message['subject'] ?? $email->getSubject()));

        $hasAttachments = (bool) ($message['hasAttachments'] ?? false);
        $email->setHasAttachments($hasAttachments);
        if ($hasAttachments) {
            try {
                $this->refreshAttachmentsFromGraph($email, $graphMailService);
            } catch (\Throwable) {
                // Mantener metadatos previos si falla la lista de adjuntos.
            }
        } else {
            $email->setAttachments(null);
        }

        $em->flush();

        return $email;
    }

    private function refreshAttachmentsFromGraph(Email $email, MicrosoftGraphMailService $graphMailService): void
    {
        $attachments = $graphMailService->listAttachments($email->getMessageId());
        $email->setAttachments($attachments === [] ? null : $attachments);
        $email->setHasAttachments($attachments !== []);
    }

    private function serialize(Email $email): array
    {
        $body = $email->getBody();
        $bodyIsHtml = $body !== '' && preg_match('/<\/?[a-z][\s\S]*>/i', $body) === 1;

        return [
            'id' => $email->getId(),
            'proveedor' => $email->getProveedor()?->getId(),
            'proveedorNombre' => $email->getProveedor()?->getNombre(),
            'categoriaId' => $email->getCategoria()?->getId(),
            'categoriaNombre' => $email->getCategoria()?->getNombre(),
            'categoriaColor' => $email->getCategoria()?->getColor(),
            'urgency' => $email->getUrgency(),
            'classificationSource' => $email->getClassificationSource(),
            'classificationReason' => $email->getClassificationReason(),
            'importacionId' => $email->getImportacion()?->getId(),
            'importacionProducto' => $email->getImportacion()?->getProducto(),
            'muestraId' => $email->getMuestra()?->getId(),
            'muestraProducto' => $email->getMuestra()?->getProducto(),
            'ofertaId' => $email->getOferta()?->getId(),
            'ofertaProducto' => $email->getOferta()?->getProducto(),
            'contratoId' => $email->getContrato()?->getId(),
            'contratoNumero' => $email->getContrato()?->getNumeroContrato(),
            'messageId' => $email->getMessageId(),
            'conversationId' => $email->getConversationId(),
            'sender' => $email->getSender(),
            'recipients' => $email->getRecipients(),
            'subject' => $email->getSubject(),
            'body' => $body,
            'bodyIsHtml' => $bodyIsHtml,
            'receivedAt' => $email->getReceivedAt()->format(\DATE_ATOM),
            'status' => $email->getStatus(),
            'createdAt' => $email->getCreatedAt()->format(\DATE_ATOM),
            'hasAttachments' => $email->hasAttachments(),
            'attachments' => $email->getAttachments() ?? [],
        ];
    }

    private function cleanEmailSubject(string $subject): string
    {
        $clean = preg_replace('/^(re|fw|fwd)\s*:\s*/i', '', trim($subject)) ?? trim($subject);

        return mb_substr($clean, 0, 255);
    }

    private function hydrateOfertaFromRequest(Oferta $o, array $data): void
    {
        if (array_key_exists('fecha', $data)) {
            $o->setFecha($data['fecha'] ? new \DateTime($data['fecha']) : null);
        }
        if (array_key_exists('producto', $data)) {
            $o->setProducto($data['producto']);
        }
        if (array_key_exists('grado', $data)) {
            $o->setGrado($data['grado']);
        }
        if (array_key_exists('cantidad', $data)) {
            $o->setCantidad($data['cantidad']);
        }
        if (array_key_exists('precio', $data)) {
            $o->setPrecio($data['precio']);
        }
        if (array_key_exists('moneda', $data)) {
            $o->setMoneda($data['moneda']);
        }
        if (array_key_exists('incoterm', $data)) {
            $o->setIncoterm($data['incoterm']);
        }
        if (array_key_exists('muestra', $data)) {
            $o->setMuestra($data['muestra'] !== null ? (bool) $data['muestra'] : null);
        }
        if (array_key_exists('tipo', $data)) {
            $o->setTipo($data['tipo']);
        }
        if (array_key_exists('documentacion', $data)) {
            $o->setDocumentacion($data['documentacion'] !== null ? (bool) $data['documentacion'] : null);
        }
        if (array_key_exists('observaciones', $data)) {
            $o->setObservaciones($data['observaciones']);
        }
    }

    private function hydrateMuestraFromRequest(Muestra $m, array $data): void
    {
        if (array_key_exists('fecha', $data)) {
            $m->setFecha($data['fecha'] ? new \DateTime($data['fecha']) : null);
        }
        if (array_key_exists('estado', $data)) {
            $m->setEstado($data['estado']);
        }
        if (array_key_exists('idLote', $data)) {
            $m->setIdLote($data['idLote']);
        }
        if (array_key_exists('producto', $data)) {
            $m->setProducto($data['producto']);
        }
        if (array_key_exists('grado', $data)) {
            $m->setGrado($data['grado']);
        }
        if (array_key_exists('documentacion', $data)) {
            $m->setDocumentacion($data['documentacion'] !== null ? (bool) $data['documentacion'] : null);
        }
        if (array_key_exists('observaciones', $data)) {
            $m->setObservaciones($data['observaciones']);
        }
    }

    private function serializeOfertaBrief(Oferta $o): array
    {
        return [
            'id' => $o->getId(),
            'fecha' => $o->getFecha()?->format('Y-m-d'),
            'proveedorId' => $o->getProveedor()?->getId(),
            'proveedorNombre' => $o->getProveedor()?->getNombre(),
            'producto' => $o->getProducto(),
            'precio' => $o->getPrecio(),
            'moneda' => $o->getMoneda(),
            'tipo' => $o->getTipo(),
        ];
    }

    private function serializeMuestraBrief(Muestra $m): array
    {
        return [
            'id' => $m->getId(),
            'fecha' => $m->getFecha()?->format('Y-m-d'),
            'proveedorId' => $m->getProveedor()?->getId(),
            'proveedorNombre' => $m->getProveedor()?->getNombre(),
            'producto' => $m->getProducto(),
            'estado' => $m->getEstado(),
            'idLote' => $m->getIdLote(),
        ];
    }
}

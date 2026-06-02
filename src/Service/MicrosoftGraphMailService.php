<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class MicrosoftGraphMailService
{
    private const BASE_URL = 'https://graph.microsoft.com/v1.0';

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly MicrosoftGraphAuthService $authService,
    ) {
    }

    private const MESSAGE_SELECT = 'id,conversationId,subject,from,toRecipients,bodyPreview,receivedDateTime,hasAttachments,isRead';

    private const MESSAGE_DETAIL_SELECT = 'id,conversationId,subject,from,toRecipients,body,bodyPreview,receivedDateTime,hasAttachments,isRead';

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listInboxMessages(int $top = 50): array
    {
        $top = max(1, min(200, $top));

        $query = http_build_query([
            '$top' => $top,
            '$orderby' => 'receivedDateTime desc',
            '$select' => self::MESSAGE_SELECT,
        ]);

        $url = $this->mailUrl('/mailFolders/inbox/messages?'.$query);
        $data = $this->requestJson('GET', $url);

        $value = $data['value'] ?? [];

        return is_array($value) ? $value : [];
    }

    /**
     * Recorre toda la bandeja de entrada paginando con @odata.nextLink.
     *
     * @return array<int, array<string, mixed>>
     */
    public function listAllInboxMessages(int $pageSize = 100): array
    {
        $pageSize = max(1, min(999, $pageSize));

        $query = http_build_query([
            '$top' => $pageSize,
            '$orderby' => 'receivedDateTime desc',
            '$select' => self::MESSAGE_SELECT,
        ]);

        $url = $this->mailUrl('/mailFolders/inbox/messages?'.$query);
        $messages = [];

        do {
            $data = $this->requestJson('GET', $url);
            $value = $data['value'] ?? [];
            if (is_array($value)) {
                foreach ($value as $message) {
                    if (is_array($message)) {
                        $messages[] = $message;
                    }
                }
            }

            $next = $data['@odata.nextLink'] ?? null;
            $url = is_string($next) && $next !== '' ? $next : null;
        } while ($url !== null);

        return $messages;
    }

    /**
     * @return array<string, mixed>
     */
    public function getMessage(string $messageId): array
    {
        $query = http_build_query([
            '$select' => self::MESSAGE_DETAIL_SELECT,
        ]);
        $url = $this->mailUrl('/messages/'.rawurlencode($messageId).'?'.$query);

        return $this->requestJson('GET', $url);
    }

    public function extractBodyText(array $message): string
    {
        $body = $message['body'] ?? null;
        if (is_array($body)) {
            $content = trim((string) ($body['content'] ?? ''));
            if ($content !== '') {
                return $content;
            }
        }

        return trim((string) ($message['bodyPreview'] ?? ''));
    }

    public function isHtmlBody(array $message): bool
    {
        $body = $message['body'] ?? null;
        if (!is_array($body)) {
            return false;
        }

        return strtoupper((string) ($body['contentType'] ?? '')) === 'HTML';
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listAttachments(string $messageId): array
    {
        $query = http_build_query([
            '$select' => 'id,name,contentType,size,@odata.type',
        ]);
        $url = $this->mailUrl('/messages/'.rawurlencode($messageId).'/attachments?'.$query);

        $data = $this->requestJson('GET', $url);
        $value = $data['value'] ?? [];
        if (!is_array($value)) {
            return [];
        }

        $attachments = [];
        foreach ($value as $item) {
            if (!is_array($item)) {
                continue;
            }
            $type = (string) ($item['@odata.type'] ?? '');
            $isFile = $type === '' || str_ends_with($type, 'fileAttachment');
            $isItem = str_ends_with($type, 'itemAttachment');
            if (!$isFile && !$isItem) {
                continue;
            }
            $name = trim((string) ($item['name'] ?? ''));
            if ($name === '') {
                $name = $isItem ? 'Elemento vinculado' : 'Adjunto';
            }
            $attachments[] = [
                'id' => $item['id'] ?? null,
                'name' => $name,
                'contentType' => $item['contentType'] ?? null,
                'size' => isset($item['size']) ? (int) $item['size'] : null,
                'downloadable' => $isFile,
                'isInline' => (bool) ($item['isInline'] ?? false),
            ];
        }

        return $attachments;
    }

    /**
     * @return array{content:string, contentType:string, fileName:string}
     */
    public function downloadAttachment(string $messageId, string $attachmentId): array
    {
        $url = $this->mailUrl('/messages/'.rawurlencode($messageId).'/attachments/'.rawurlencode($attachmentId));

        $data = $this->requestJson('GET', $url);
        $odataType = (string) ($data['@odata.type'] ?? '');
        if ($odataType !== '' && !str_ends_with($odataType, 'fileAttachment')) {
            throw new \RuntimeException('Este tipo de adjunto no se puede descargar desde Outlook (solo archivos).');
        }

        $contentBytes = (string) ($data['contentBytes'] ?? '');
        if ($contentBytes === '') {
            throw new \RuntimeException('El adjunto no incluye contenido descargable.');
        }

        $decoded = base64_decode($contentBytes, true);
        if ($decoded === false) {
            throw new \RuntimeException('No se pudo decodificar el adjunto.');
        }

        return [
            'content' => $decoded,
            'contentType' => (string) ($data['contentType'] ?? 'application/octet-stream'),
            'fileName' => (string) ($data['name'] ?? 'adjunto.bin'),
        ];
    }

    /**
     * @param array<int, string> $to
     * @param array<int, string> $cc
     */
    /**
     * @param array<int, array{name: string, contentType: string, contentBase64: string}> $attachments
     */
    public function sendMail(array $to, array $cc, string $subject, string $body, array $attachments = []): void
    {
        if ($to === []) {
            throw new \InvalidArgumentException('Debe indicar al menos un destinatario.');
        }

        $makeRecipient = static fn (string $email) => ['emailAddress' => ['address' => $email]];
        $toRecipients = array_map($makeRecipient, $to);
        $ccRecipients = array_map($makeRecipient, $cc);

        $message = [
            'subject' => $subject,
            'body' => [
                'contentType' => 'HTML',
                'content' => $this->bodyToHtml($body),
            ],
            'toRecipients' => $toRecipients,
            'ccRecipients' => $ccRecipients,
        ];

        $graphAttachments = $this->buildGraphFileAttachments($attachments);
        if ($graphAttachments !== []) {
            $message['attachments'] = $graphAttachments;
        }

        $url = $this->mailUrl('/sendMail');
        $response = $this->httpClient->request('POST', $url, [
            'headers' => $this->authHeaders() + ['Content-Type' => 'application/json'],
            'json' => [
                'message' => $message,
                'saveToSentItems' => true,
            ],
        ]);

        $status = $response->getStatusCode();
        if ($status >= Response::HTTP_BAD_REQUEST) {
            $payload = $response->toArray(false);
            $message = (string) ($payload['error']['message'] ?? 'Error enviando correo con Graph');
            throw new \RuntimeException($message);
        }
    }

    /**
     * @param array<int, array{name: string, contentType: string, contentBase64: string}> $attachments
     */
    public function replyToMessage(string $messageId, string $body, bool $replyAll = false, array $attachments = []): void
    {
        $messageId = trim($messageId);
        if ($messageId === '') {
            throw new \InvalidArgumentException('messageId vacio.');
        }

        $message = [
            'body' => [
                'contentType' => 'HTML',
                'content' => $this->bodyToHtml($body),
            ],
        ];

        $graphAttachments = $this->buildGraphFileAttachments($attachments);
        if ($graphAttachments !== []) {
            $message['attachments'] = $graphAttachments;
        }

        $action = $replyAll ? 'replyAll' : 'reply';
        $url = $this->mailUrl('/messages/' . rawurlencode($messageId) . '/' . $action);
        $response = $this->httpClient->request('POST', $url, [
            'headers' => $this->authHeaders() + ['Content-Type' => 'application/json'],
            'json' => ['message' => $message],
        ]);

        $status = $response->getStatusCode();
        if ($status >= Response::HTTP_BAD_REQUEST) {
            $payload = $response->toArray(false);
            $message = (string) ($payload['error']['message'] ?? 'Error respondiendo correo con Graph');
            throw new \RuntimeException($message);
        }
    }

    /**
     * @param array<int, array{name?: string, contentType?: string, contentBase64?: string}> $attachments
     * @return array<int, array<string, mixed>>
     */
    private function buildGraphFileAttachments(array $attachments): array
    {
        $result = [];
        foreach ($attachments as $item) {
            if (!is_array($item)) {
                continue;
            }
            $name = trim((string) ($item['name'] ?? ''));
            $contentBase64 = trim((string) ($item['contentBase64'] ?? ''));
            if ($name === '' || $contentBase64 === '') {
                continue;
            }

            $decoded = base64_decode($contentBase64, true);
            if ($decoded === false) {
                throw new \InvalidArgumentException(sprintf('Adjunto "%s": contenido base64 invalido.', $name));
            }

            $maxBytes = 3 * 1024 * 1024;
            if (strlen($decoded) > $maxBytes) {
                throw new \InvalidArgumentException(sprintf('Adjunto "%s" supera 3 MB (limite de Graph).', $name));
            }

            $result[] = [
                '@odata.type' => '#microsoft.graph.fileAttachment',
                'name' => $name,
                'contentType' => (string) ($item['contentType'] ?? 'application/octet-stream'),
                'contentBytes' => $contentBase64,
            ];
        }

        return $result;
    }

    /**
     * @param array<int, mixed> $raw
     * @return array<int, array{name: string, contentType: string, contentBase64: string}>
     */
    public function normalizeOutgoingAttachments(array $raw): array
    {
        $result = [];
        foreach ($raw as $item) {
            if (!is_array($item)) {
                continue;
            }
            $name = trim((string) ($item['name'] ?? ''));
            $contentBase64 = trim((string) ($item['contentBase64'] ?? ''));
            if ($name === '' || $contentBase64 === '') {
                continue;
            }
            $result[] = [
                'name' => $name,
                'contentType' => (string) ($item['contentType'] ?? 'application/octet-stream'),
                'contentBase64' => $contentBase64,
            ];
        }

        return $result;
    }

    private function bodyToHtml(string $body): string
    {
        $body = trim($body);
        if ($body === '') {
            return '<p></p>';
        }
        if (preg_match('/<\/?[a-z][\s\S]*>/i', $body) === 1) {
            return $body;
        }

        $escaped = htmlspecialchars($body, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

        return '<p>' . str_replace("\n", "</p><p>", $escaped) . '</p>';
    }

    /**
     * @return array<string, mixed>
     */
    private function requestJson(string $method, string $url): array
    {
        $response = $this->httpClient->request($method, $url, [
            'headers' => $this->authHeaders(),
        ]);

        $status = $response->getStatusCode();
        $raw = $response->getContent(false);
        $payload = $raw !== '' ? json_decode($raw, true) : null;

        if ($status >= Response::HTTP_BAD_REQUEST) {
            $this->throwGraphError($status, is_array($payload) ? $payload : null);
        }

        return is_array($payload) ? $payload : [];
    }

    /**
     * @return array<string, string>
     */
    private function authHeaders(): array
    {
        return [
            'Authorization' => 'Bearer ' . $this->authService->getAccessToken(),
            'Accept' => 'application/json',
        ];
    }

    private function mailUrl(string $path): string
    {
        $path = str_starts_with($path, '/') ? $path : '/'.$path;

        if ($this->authService->usesDelegatedAuth()) {
            return self::BASE_URL.'/me'.$path;
        }

        $mailbox = trim((string) ($_ENV['MS_GRAPH_MAILBOX_USER'] ?? ''));
        if ($mailbox === '') {
            throw new \RuntimeException(
                'Falta MS_GRAPH_MAILBOX_USER o conecta tu cuenta en Correos → Conectar Outlook.',
            );
        }

        return sprintf('%s/users/%s%s', self::BASE_URL, rawurlencode($mailbox), $path);
    }

    /**
     * @param array<string, mixed>|null $payload
     */
    private function throwGraphError(int $status, ?array $payload): void
    {
        $code = is_array($payload) ? (string) ($payload['error']['code'] ?? '') : '';
        $message = is_array($payload)
            ? (string) ($payload['error']['message'] ?? $payload['error_description'] ?? 'Error en llamada a Microsoft Graph')
            : 'Error en llamada a Microsoft Graph';

        $hint = $this->graphErrorHint($status, $code);
        $suffix = $hint !== '' ? ' — '.$hint : '';

        throw new \RuntimeException(sprintf('Graph HTTP %d: %s%s', $status, $message, $suffix));
    }

    private function graphErrorHint(int $status, string $code): string
    {
        if ($status < Response::HTTP_BAD_REQUEST) {
            return '';
        }

        if (!$this->authService->usesDelegatedAuth()) {
            $mailbox = trim((string) ($_ENV['MS_GRAPH_MAILBOX_USER'] ?? ''));
            if ($mailbox !== '' && preg_match('/@(hotmail|outlook|live)\.com$/i', $mailbox) === 1) {
                return 'Conecta tu cuenta en Correos → «Conectar Outlook» (Hotmail/Outlook personal). No hace falta crear una organización M365.';
            }

            if (
                $status === Response::HTTP_UNAUTHORIZED
                || $status === Response::HTTP_FORBIDDEN
                || $code === 'Authorization_RequestDenied'
            ) {
                return 'Conecta Outlook en la app, o configura permisos de aplicación M365 en Azure (Mail.Read + admin consent).';
            }
        } elseif ($status === Response::HTTP_UNAUTHORIZED) {
            return 'Vuelve a conectar Outlook en Correos (sesión expirada o permisos revocados).';
        }

        return '';
    }
}


<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class MicrosoftGraphCalendarService
{
    private const BASE_URL = 'https://graph.microsoft.com/v1.0';

    private const EVENT_SELECT = 'id,subject,bodyPreview,body,start,end,isAllDay,location,organizer,attendees,webLink';

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly MicrosoftGraphAuthService $authService,
    ) {
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listCalendarView(\DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        $query = http_build_query([
            'startDateTime' => $from->format(\DATE_ATOM),
            'endDateTime' => $to->format(\DATE_ATOM),
            '$select' => self::EVENT_SELECT,
            '$orderby' => 'start/dateTime',
            '$top' => 200,
        ]);

        $url = $this->calendarUrl('/calendarView?'.$query);
        $events = [];

        do {
            $data = $this->requestJson('GET', $url);
            $value = $data['value'] ?? [];
            if (is_array($value)) {
                foreach ($value as $event) {
                    if (is_array($event)) {
                        $events[] = $event;
                    }
                }
            }

            $next = $data['@odata.nextLink'] ?? null;
            $url = is_string($next) && $next !== '' ? $next : null;
        } while ($url !== null);

        return $events;
    }

    /**
     * @return array<string, mixed>
     */
    public function createEvent(array $payload): array
    {
        $url = $this->calendarUrl('/events');

        return $this->requestJson('POST', $url, $payload);
    }

    /**
     * @return array<string, mixed>
     */
    public function updateEvent(string $graphEventId, array $payload): array
    {
        $url = $this->calendarUrl('/events/'.rawurlencode($graphEventId));

        return $this->requestJson('PATCH', $url, $payload);
    }

    public function deleteEvent(string $graphEventId): void
    {
        $url = $this->calendarUrl('/events/'.rawurlencode($graphEventId));
        $this->requestJson('DELETE', $url);
    }

    /**
     * @param array<string, mixed> $event
     */
    public function buildCreatePayload(
        string $subject,
        \DateTimeImmutable $start,
        \DateTimeImmutable $end,
        bool $allDay = false,
        ?string $description = null,
        ?string $location = null,
    ): array {
        $tz = date_default_timezone_get() ?: 'Europe/Madrid';
        $payload = [
            'subject' => $subject,
            'start' => $this->dateTimePayload($start, $allDay, $tz),
            'end' => $this->dateTimePayload($end, $allDay, $tz),
            'isAllDay' => $allDay,
        ];

        if ($description !== null && $description !== '') {
            $payload['body'] = [
                'contentType' => 'HTML',
                'content' => nl2br(htmlspecialchars($description, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')),
            ];
        }

        if ($location !== null && $location !== '') {
            $payload['location'] = ['displayName' => $location];
        }

        return $payload;
    }

    /**
     * @return array{dateTime?: string, date?: string, timeZone: string}
     */
    private function dateTimePayload(\DateTimeImmutable $dt, bool $allDay, string $tz): array
    {
        if ($allDay) {
            return [
                'date' => $dt->format('Y-m-d'),
                'timeZone' => $tz,
            ];
        }

        return [
            'dateTime' => $dt->format('Y-m-d\TH:i:s'),
            'timeZone' => $tz,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function requestJson(string $method, string $url, ?array $body = null): array
    {
        $options = ['headers' => $this->authHeaders()];
        if ($body !== null) {
            $options['json'] = $body;
        }

        $response = $this->httpClient->request($method, $url, $options);
        $status = $response->getStatusCode();

        if ($method === 'DELETE' && ($status === Response::HTTP_NO_CONTENT || $status === Response::HTTP_OK)) {
            return [];
        }

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
            'Authorization' => 'Bearer '.$this->authService->getAccessToken(),
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ];
    }

    private function calendarUrl(string $path): string
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
            if (
                $status === Response::HTTP_UNAUTHORIZED
                || $status === Response::HTTP_FORBIDDEN
                || $code === 'Authorization_RequestDenied'
            ) {
                return 'Conecta Outlook en la app o añade permisos Calendars.ReadWrite en Azure.';
            }
        } elseif (
            $status === Response::HTTP_UNAUTHORIZED
            || $status === Response::HTTP_FORBIDDEN
            || $code === 'ErrorAccessDenied'
            || $code === 'Authorization_RequestDenied'
        ) {
            return 'En Calendario pulsa «Reautorizar Outlook» y acepta permisos de calendario (la conexión anterior solo tenía correo).';
        }

        return '';
    }
}

<?php

namespace App\Service;

use App\Entity\CalendarEvent;
use App\Repository\CalendarEventRepository;
use Doctrine\ORM\EntityManagerInterface;

class CalendarGraphSyncService
{
    public function __construct(
        private readonly MicrosoftGraphCalendarService $graphCalendarService,
        private readonly CalendarEventRepository $eventRepository,
        private readonly EntityManagerInterface $em,
    ) {
    }

    /**
     * @return array{events: array<int, CalendarEvent>, imported: int, updated: int, fetched: int}
     */
    public function sync(\DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        $graphEvents = $this->graphCalendarService->listCalendarView($from, $to);
        $imported = 0;
        $updated = 0;
        $saved = [];

        foreach ($graphEvents as $graphEvent) {
            if (!is_array($graphEvent)) {
                continue;
            }

            $graphId = trim((string) ($graphEvent['id'] ?? ''));
            if ($graphId === '') {
                continue;
            }

            $existing = $this->eventRepository->findOneByGraphEventId($graphId);
            $event = $existing ?? new CalendarEvent();
            $isNew = $existing === null;

            $this->mapGraphToEntity($graphEvent, $event);
            $this->em->persist($event);
            $saved[] = $event;

            if ($isNew) {
                ++$imported;
            } else {
                ++$updated;
            }
        }

        $this->em->flush();

        return [
            'events' => $saved,
            'imported' => $imported,
            'updated' => $updated,
            'fetched' => count($graphEvents),
        ];
    }

    /**
     * @param array<string, mixed> $graphEvent
     */
    public function mapGraphToEntity(array $graphEvent, CalendarEvent $event): void
    {
        $event
            ->setGraphEventId((string) ($graphEvent['id'] ?? ''))
            ->setSubject((string) ($graphEvent['subject'] ?? '(Sin título)'))
            ->setDescription($this->extractDescription($graphEvent))
            ->setLocation($this->extractLocation($graphEvent))
            ->setStartAt($this->parseGraphDateTime($graphEvent['start'] ?? null))
            ->setEndAt($this->parseGraphDateTime($graphEvent['end'] ?? null))
            ->setAllDay((bool) ($graphEvent['isAllDay'] ?? false))
            ->setOrganizer($this->extractOrganizer($graphEvent))
            ->setAttendees($this->extractAttendees($graphEvent))
            ->setSource(CalendarEvent::SOURCE_OUTLOOK)
            ->setWebLink(isset($graphEvent['webLink']) ? (string) $graphEvent['webLink'] : null)
            ->touch();
    }

    /**
     * @param array<string, mixed> $graphEvent
     */
    private function extractDescription(array $graphEvent): ?string
    {
        $body = $graphEvent['body'] ?? null;
        if (is_array($body)) {
            $content = trim(strip_tags((string) ($body['content'] ?? '')));
            if ($content !== '') {
                return $content;
            }
        }

        $preview = trim((string) ($graphEvent['bodyPreview'] ?? ''));

        return $preview !== '' ? $preview : null;
    }

    /**
     * @param array<string, mixed> $graphEvent
     */
    private function extractLocation(array $graphEvent): ?string
    {
        $location = $graphEvent['location'] ?? null;
        if (!is_array($location)) {
            return null;
        }

        $name = trim((string) ($location['displayName'] ?? ''));

        return $name !== '' ? $name : null;
    }

    /**
     * @param array<string, mixed> $graphEvent
     */
    private function extractOrganizer(array $graphEvent): ?string
    {
        $organizer = $graphEvent['organizer'] ?? null;
        if (!is_array($organizer)) {
            return null;
        }

        $email = $organizer['emailAddress'] ?? null;
        if (!is_array($email)) {
            return null;
        }

        $name = trim((string) ($email['name'] ?? ''));
        $address = trim((string) ($email['address'] ?? ''));

        if ($name !== '' && $address !== '') {
            return sprintf('%s <%s>', $name, $address);
        }

        return $address !== '' ? $address : ($name !== '' ? $name : null);
    }

    /**
     * @param array<string, mixed> $graphEvent
     * @return array<int, string>|null
     */
    private function extractAttendees(array $graphEvent): ?array
    {
        $attendees = $graphEvent['attendees'] ?? null;
        if (!is_array($attendees) || $attendees === []) {
            return null;
        }

        $list = [];
        foreach ($attendees as $attendee) {
            if (!is_array($attendee)) {
                continue;
            }
            $email = $attendee['emailAddress'] ?? null;
            if (!is_array($email)) {
                continue;
            }
            $address = trim((string) ($email['address'] ?? ''));
            if ($address !== '') {
                $list[] = $address;
            }
        }

        return $list === [] ? null : $list;
    }

    /**
     * @param array<string, mixed>|null $value
     */
    private function parseGraphDateTime(?array $value): \DateTimeImmutable
    {
        if ($value === null) {
            return new \DateTimeImmutable();
        }

        $dateTime = trim((string) ($value['dateTime'] ?? ''));
        if ($dateTime !== '') {
            try {
                return new \DateTimeImmutable($dateTime);
            } catch (\Throwable) {
                // fallback below
            }
        }

        $date = trim((string) ($value['date'] ?? ''));
        if ($date !== '') {
            return new \DateTimeImmutable($date.' 00:00:00');
        }

        return new \DateTimeImmutable();
    }
}

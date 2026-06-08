<?php

namespace App\Service;

use App\Entity\CalendarEvent;
use App\Entity\Email;

class ActivityTimelineBuilder
{
    public function emailItem(Email $email): array
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

    public function eventItem(CalendarEvent $event): array
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

    /**
     * @param list<array<string, mixed>> $items
     * @return list<array<string, mixed>>
     */
    public function sortDesc(array $items): array
    {
        usort($items, static fn (array $a, array $b) => strcmp($b['date'], $a['date']));

        return $items;
    }
}

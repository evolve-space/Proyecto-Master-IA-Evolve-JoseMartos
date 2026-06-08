<?php

namespace App\Service;

use App\Entity\Contrato;
use App\Entity\Importacion;
use App\Entity\Muestra;
use App\Entity\Oferta;
use App\Repository\CalendarEventRepository;
use App\Repository\EmailRepository;

class EntityFichaService
{
    public function __construct(
        private readonly EmailRepository $emailRepository,
        private readonly CalendarEventRepository $calendarEventRepository,
        private readonly ActivityTimelineBuilder $timelineBuilder,
    ) {
    }

    /**
     * @return array{stats: array{emails: int, eventos: int}, items: list<array<string, mixed>>}
     */
    public function forOferta(Oferta $oferta): array
    {
        return $this->build(
            $this->emailRepository->findByOferta($oferta),
            $this->calendarEventRepository->findByOferta($oferta),
        );
    }

    /**
     * @return array{stats: array{emails: int, eventos: int}, items: list<array<string, mixed>>}
     */
    public function forMuestra(Muestra $muestra): array
    {
        return $this->build(
            $this->emailRepository->findByMuestra($muestra),
            $this->calendarEventRepository->findByMuestra($muestra),
        );
    }

    /**
     * @return array{stats: array{emails: int, eventos: int}, items: list<array<string, mixed>>}
     */
    public function forContrato(Contrato $contrato): array
    {
        return $this->build(
            $this->emailRepository->findByContrato($contrato),
            $this->calendarEventRepository->findByContrato($contrato),
        );
    }

    /**
     * @return array{stats: array{emails: int, eventos: int}, items: list<array<string, mixed>>}
     */
    public function forImportacion(Importacion $importacion): array
    {
        return $this->build(
            $this->emailRepository->findByImportacion($importacion),
            $this->calendarEventRepository->findByImportacion($importacion),
        );
    }

    /**
     * @param \App\Entity\Email[] $emails
     * @param \App\Entity\CalendarEvent[] $events
     */
    private function build(array $emails, array $events): array
    {
        $items = [];
        foreach ($emails as $email) {
            $items[] = $this->timelineBuilder->emailItem($email);
        }
        foreach ($events as $event) {
            $items[] = $this->timelineBuilder->eventItem($event);
        }

        return [
            'stats' => [
                'emails' => \count($emails),
                'eventos' => \count($events),
            ],
            'items' => $this->timelineBuilder->sortDesc($items),
        ];
    }
}

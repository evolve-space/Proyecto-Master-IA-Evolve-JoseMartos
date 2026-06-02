<?php

namespace App\Service;

use App\Entity\Email;

class EmailGraphSyncService
{
    private const IMPORT_BATCH_SIZE = 100;

    public function __construct(
        private readonly MicrosoftGraphMailService $graphMailService,
        private readonly EmailImportService $emailImportService,
    ) {
    }

    /**
     * @return array{
     *     emails: array<int, Email>,
     *     imported: int,
     *     duplicated: int,
     *     failed: int,
     *     fetched: int,
     *     errors: array<int, array<string, string|int>>
     * }
     */
    public function sync(bool $all = true, int $top = 50, bool $includeAttachments = false): array
    {
        $messages = $all
            ? $this->graphMailService->listAllInboxMessages()
            : $this->graphMailService->listInboxMessages($top);

        $items = [];
        foreach ($messages as $message) {
            if (!is_array($message)) {
                continue;
            }
            $item = $this->mapGraphMessageToImport($message, $includeAttachments);
            if ($item !== null) {
                $items[] = $item;
            }
        }

        return $this->importInBatches($items);
    }

    /**
     * @param array<int, array<string, mixed>> $items
     * @return array{
     *     emails: array<int, Email>,
     *     imported: int,
     *     duplicated: int,
     *     failed: int,
     *     fetched: int,
     *     errors: array<int, array<string, string|int>>
     * }
     */
    private function importInBatches(array $items): array
    {
        $totals = [
            'emails' => [],
            'imported' => 0,
            'duplicated' => 0,
            'failed' => 0,
            'fetched' => count($items),
            'errors' => [],
        ];

        foreach (array_chunk($items, self::IMPORT_BATCH_SIZE) as $batch) {
            $result = $this->emailImportService->importBulk($batch);
            $totals['emails'] = array_merge($totals['emails'], $result['emails']);
            $totals['imported'] += $result['imported'];
            $totals['duplicated'] += $result['duplicated'];
            $totals['failed'] += $result['failed'];
            $totals['errors'] = array_merge($totals['errors'], $result['errors']);
        }

        return $totals;
    }

    /**
     * @param array<string, mixed> $message
     * @return array<string, mixed>|null
     */
    private function mapGraphMessageToImport(array $message, bool $includeAttachments): ?array
    {
        $messageId = trim((string) ($message['id'] ?? ''));
        if ($messageId === '') {
            return null;
        }

        $attachments = null;
        $hasAttachments = (bool) ($message['hasAttachments'] ?? false);
        if ($includeAttachments && $hasAttachments) {
            try {
                $attachments = $this->graphMailService->listAttachments($messageId);
            } catch (\Throwable) {
                $attachments = null;
            }
        }

        $sender = (string) ($message['from']['emailAddress']['address'] ?? '');
        $toRecipients = $message['toRecipients'] ?? [];
        $recipientEmails = [];
        if (is_array($toRecipients)) {
            foreach ($toRecipients as $recipient) {
                if (!is_array($recipient)) {
                    continue;
                }
                $addr = trim((string) ($recipient['emailAddress']['address'] ?? ''));
                if ($addr !== '') {
                    $recipientEmails[] = $addr;
                }
            }
        }

        return [
            'messageId' => $messageId,
            'conversationId' => $message['conversationId'] ?? null,
            'sender' => $sender !== '' ? $sender : 'desconocido@local',
            'recipients' => $recipientEmails !== [] ? implode(', ', $recipientEmails) : null,
            'subject' => (string) ($message['subject'] ?? '(Sin asunto)'),
            'body' => (string) ($message['bodyPreview'] ?? ''),
            'receivedAt' => (string) ($message['receivedDateTime'] ?? ''),
            'status' => (bool) ($message['isRead'] ?? false) ? Email::STATUS_READ : Email::STATUS_PENDING,
            'hasAttachments' => $hasAttachments,
            'attachments' => $attachments,
        ];
    }
}

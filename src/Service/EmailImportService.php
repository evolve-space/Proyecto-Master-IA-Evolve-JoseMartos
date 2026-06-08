<?php

namespace App\Service;

use App\Entity\Email;
use App\Entity\EmailExclusion;
use App\Repository\EmailExclusionRepository;
use App\Repository\EmailRepository;
use App\Repository\ProveedorRepository;
use Doctrine\ORM\EntityManagerInterface;

class EmailImportService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly EmailRepository $emailRepository,
        private readonly ProveedorRepository $proveedorRepository,
        private readonly EmailExclusionRepository $emailExclusionRepository,
        private readonly EmailClassificationService $classificationService,
    ) {
    }

    /**
     * @param array<string, mixed> $data
     */
    public function import(array $data): Email
    {
        $messageId = trim((string) ($data['messageId'] ?? ''));
        if ($messageId === '') {
            throw new \InvalidArgumentException('messageId es obligatorio.');
        }

        if ($this->emailExclusionRepository->existsByMessageId($messageId)) {
            throw new \InvalidArgumentException('Este correo fue eliminado en la aplicacion.');
        }

        $existing = $this->emailRepository->findOneByMessageId($messageId);
        if ($existing instanceof Email) {
            if ($this->mergeAttachmentMetadata($existing, $data)) {
                $this->em->flush();
            }

            return $existing;
        }

        $email = $this->buildEmailFromData($data);
        $this->em->persist($email);
        $this->em->flush();
        $this->classificationService->classifyAndApply($email);

        return $email;
    }

    /**
     * @param array<int, array<string, mixed>> $items
     * @return array{emails: Email[], imported: int, duplicated: int, failed: int, errors: array<int, array<string, string|int>>}
     */
    public function importBulk(array $items): array
    {
        $emails = [];
        $imported = 0;
        $duplicated = 0;
        $failed = 0;
        $errors = [];
        $toClassify = [];

        foreach ($items as $index => $data) {
            if (!is_array($data)) {
                ++$failed;
                $errors[] = ['index' => $index, 'error' => 'Elemento invalido'];
                continue;
            }

            try {
                $messageId = trim((string) ($data['messageId'] ?? ''));
                if ($messageId === '') {
                    throw new \InvalidArgumentException('messageId es obligatorio.');
                }

                if ($this->emailExclusionRepository->existsByMessageId($messageId)) {
                    continue;
                }

                $existing = $this->emailRepository->findOneByMessageId($messageId);
                if ($existing instanceof Email) {
                    ++$duplicated;
                    $this->mergeAttachmentMetadata($existing, $data);
                    $emails[] = $existing;
                    continue;
                }

                $email = $this->buildEmailFromData($data);
                $this->em->persist($email);
                ++$imported;
                $emails[] = $email;
                $toClassify[] = $email;
            } catch (\Throwable $e) {
                ++$failed;
                $errors[] = ['index' => $index, 'error' => $e->getMessage()];
            }
        }

        if ($imported > 0 || $duplicated > 0) {
            $this->em->flush();
        }

        foreach ($toClassify as $email) {
            try {
                $this->classificationService->classifyAndApply($email);
            } catch (\Throwable) {
                // No bloquear importación masiva por fallo de clasificación.
            }
        }

        return [
            'emails' => $emails,
            'imported' => $imported,
            'duplicated' => $duplicated,
            'failed' => $failed,
            'errors' => $errors,
        ];
    }

    /**
     * @param array<string, mixed> $data
     */
    private function buildEmailFromData(array $data): Email
    {
        $sender = trim((string) ($data['sender'] ?? ''));
        $subject = trim((string) ($data['subject'] ?? ''));

        if ($sender === '' || $subject === '') {
            throw new \InvalidArgumentException('sender y subject son obligatorios.');
        }

        $email = new Email();
        $email
            ->setMessageId(trim((string) $data['messageId']))
            ->setConversationId($this->nullableString($data['conversationId'] ?? null))
            ->setSender($sender)
            ->setRecipients($this->nullableString($data['recipients'] ?? null))
            ->setSubject($subject)
            ->setBody((string) ($data['body'] ?? ''))
            ->setReceivedAt($this->parseDate((string) ($data['receivedAt'] ?? '')))
            ->setStatus((string) ($data['status'] ?? Email::STATUS_PENDING));

        [$hasAttachments, $attachments] = $this->normalizeAttachments($data);
        $email->setHasAttachments($hasAttachments);
        $email->setAttachments($attachments);

        $proveedor = $this->resolveProveedor($sender, $email->getRecipients());
        if ($proveedor !== null) {
            $email->setProveedor($proveedor);
        }

        return $email;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function mergeAttachmentMetadata(Email $email, array $data): bool
    {
        if (!array_key_exists('attachments', $data) && !array_key_exists('hasAttachments', $data) && !array_key_exists('has_attachments', $data)) {
            return false;
        }

        [$hasAttachments, $attachments] = $this->normalizeAttachments($data);
        $email->setHasAttachments($hasAttachments);
        $email->setAttachments($attachments);

        return true;
    }

    /**
     * @param array<string, mixed> $data
     * @return array{0: bool, 1: array<int, array<string, mixed>>|null}
     */
    private function normalizeAttachments(array $data): array
    {
        $raw = $data['attachments'] ?? null;
        $list = [];

        if (is_array($raw)) {
            foreach ($raw as $item) {
                if (!is_array($item)) {
                    continue;
                }
                $name = trim((string) ($item['name'] ?? $item['fileName'] ?? ''));
                if ($name === '') {
                    continue;
                }
                $entry = [
                    'id' => $item['id'] ?? $item['attachmentId'] ?? null,
                    'name' => $name,
                    'contentType' => $item['contentType'] ?? $item['mimeType'] ?? null,
                    'size' => isset($item['size']) ? (int) $item['size'] : null,
                    'downloadable' => (bool) ($item['downloadable'] ?? true),
                    'isInline' => (bool) ($item['isInline'] ?? false),
                ];
                $contentId = $item['contentId'] ?? $item['content_id'] ?? null;
                if ($contentId !== null && $contentId !== '') {
                    $entry['contentId'] = (string) $contentId;
                }
                $list[] = $entry;
            }
        }

        $hasAttachments = (bool) ($data['hasAttachments'] ?? $data['has_attachments'] ?? false);
        if ($list !== []) {
            $hasAttachments = true;
        }

        return [$hasAttachments, $list === [] ? null : $list];
    }

    private function nullableString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = trim((string) $value);

        return $normalized === '' ? null : $normalized;
    }

    private function parseDate(string $input): \DateTimeImmutable
    {
        $value = trim($input);
        if ($value === '') {
            return new \DateTimeImmutable();
        }

        try {
            return new \DateTimeImmutable($value);
        } catch (\Exception) {
            throw new \InvalidArgumentException('receivedAt no tiene un formato de fecha valido.');
        }
    }

    private function extractEmailAddress(string $raw): ?string
    {
        if (preg_match('/<([^>]+)>/', $raw, $matches) === 1) {
            $candidate = strtolower(trim($matches[1]));

            return filter_var($candidate, FILTER_VALIDATE_EMAIL) ? $candidate : null;
        }

        $candidate = strtolower(trim($raw));

        return filter_var($candidate, FILTER_VALIDATE_EMAIL) ? $candidate : null;
    }

    private function resolveProveedor(string $sender, ?string $recipients): ?\App\Entity\Proveedor
    {
        $candidates = [];
        $senderEmail = $this->extractEmailAddress($sender);
        if ($senderEmail !== null) {
            $candidates[] = $senderEmail;
        }

        if ($recipients !== null) {
            $parts = preg_split('/[,;]+/', $recipients) ?: [];
            foreach ($parts as $part) {
                $parsed = $this->extractEmailAddress((string) $part);
                if ($parsed !== null) {
                    $candidates[] = $parsed;
                }
            }
        }

        foreach (array_unique($candidates) as $candidate) {
            $proveedor = $this->proveedorRepository->findOneByEmail($candidate);
            if ($proveedor !== null) {
                return $proveedor;
            }
        }

        return null;
    }
}

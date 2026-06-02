<?php

namespace App\Controller;

use App\Service\MicrosoftGraphMailService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/outlook', name: 'api_outlook_')]
class OutlookController extends AbstractController
{
    #[Route('/send', name: 'send', methods: ['POST'])]
    public function send(Request $request, MicrosoftGraphMailService $graphMailService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalido.'], 400);
        }

        $to = $this->normalizeRecipients($data['to'] ?? null);
        $cc = $this->normalizeRecipients($data['cc'] ?? null);
        $subject = trim((string) ($data['subject'] ?? ''));
        $body = (string) ($data['body'] ?? '');

        if ($to === []) {
            return $this->json(['error' => 'Debe indicar al menos un destinatario.'], 400);
        }
        if ($subject === '') {
            return $this->json(['error' => 'El asunto es obligatorio.'], 400);
        }

        $attachments = $graphMailService->normalizeOutgoingAttachments(
            is_array($data['attachments'] ?? null) ? $data['attachments'] : [],
        );

        try {
            $graphMailService->sendMail($to, $cc, $subject, $body, $attachments);

            return $this->json([
                'ok' => true,
                'message' => 'Correo enviado con Microsoft Graph.',
            ]);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * @return array<int, string>
     */
    private function normalizeRecipients(mixed $value): array
    {
        if ($value === null) {
            return [];
        }
        if (is_string($value)) {
            $parts = preg_split('/[,;]+/', $value) ?: [];

            return array_values(array_filter(array_map(
                static fn (string $x) => trim($x),
                $parts,
            )));
        }
        if (is_array($value)) {
            $result = [];
            foreach ($value as $item) {
                $email = trim((string) $item);
                if ($email !== '') {
                    $result[] = $email;
                }
            }

            return array_values(array_unique($result));
        }

        return [];
    }
}


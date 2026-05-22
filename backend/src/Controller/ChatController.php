<?php

namespace App\Controller;

use App\Service\OrchestratorService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Endpoint del sistema multi-agente.
 *
 * POST /api/chat
 * Authorization: Bearer <jwt>
 *
 * Body:
 * {
 *   "message": "...",
 *   "history": [{"role":"user|assistant","content":"..."}],
 *   "context": { "userId": 1, "userRole": "admin", "currentPage": "proveedores" }
 * }
 *
 * Response 200:
 * {
 *   "reply": "...",
 *   "agent": { "name": "Carmen", "id": "carmen" }
 * }
 */
#[Route('/api/chat', name: 'api_chat_')]
class ChatController extends AbstractController
{
    #[Route('', name: 'chat', methods: ['POST'])]
    public function chat(Request $request, OrchestratorService $orchestrator): JsonResponse
    {
        // ── 1. Extraer JWT ──────────────────────────────────────────
        $authHeader = $request->headers->get('Authorization', '');

        if (!str_starts_with($authHeader, 'Bearer ')) {
            return $this->json(
                ['error' => 'Token JWT no proporcionado o formato incorrecto.'],
                Response::HTTP_UNAUTHORIZED,
            );
        }

        $jwt = substr($authHeader, 7);

        // ── 2. Parsear body ─────────────────────────────────────────
        $body = json_decode($request->getContent(), true);

        if (!is_array($body)) {
            return $this->json(
                ['error' => 'El cuerpo de la petición debe ser JSON válido.'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $message = trim((string) ($body['message'] ?? ''));

        if ($message === '') {
            return $this->json(
                ['error' => 'El campo "message" es obligatorio y no puede estar vacío.'],
                Response::HTTP_BAD_REQUEST,
            );
        }

        $history = is_array($body['history'] ?? null) ? $body['history'] : [];
        $context = is_array($body['context'] ?? null) ? $body['context'] : [];

        // ── 3. Enriquecer contexto con datos del usuario autenticado ─
        /** @var \App\Entity\Usuario|null $user */
        $user = $this->getUser();

        if ($user !== null) {
            $context['userId']   ??= $user->getId();
            $context['userRole'] ??= $user->getTipo();
        }

        // ── 4. Procesar con el orquestador ──────────────────────────
        // Aumentar el tiempo de ejecución para llamadas a OpenAI (puede tardar hasta ~60 s)
        set_time_limit(120);

        try {
            $result = $orchestrator->process($message, $history, $context, $jwt);
        } catch (\Throwable $e) {
            return $this->json(
                ['error' => 'Error interno del agente: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR,
            );
        }

        return $this->json($result);
    }
}

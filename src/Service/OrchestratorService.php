<?php

namespace App\Service;

use App\Agent\AgentInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Orquestador del sistema multi-agente.
 *
 * Flujo:
 *   1. Recibe el mensaje del usuario + historial + contexto + JWT.
 *   2. Llama al clasificador OpenAI para detectar la intención y seleccionar el agente.
 *   3. Verifica permisos del agente (p.ej. Alex solo para admin/superadmin).
 *   4. Delega al agente seleccionado, que consulta la API SRM y genera la respuesta.
 *   5. Devuelve { reply, agent: { name, id } }.
 */
class OrchestratorService
{
    /** @param iterable<AgentInterface> $agents */
    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly string $openAiApiKey,
        private readonly string $openAiModel,
        private readonly iterable $agents,
    ) {}

    // ──────────────────────────────────────────────────────────────
    // Punto de entrada público
    // ──────────────────────────────────────────────────────────────

    /**
     * Procesa una conversación y devuelve la respuesta del agente elegido.
     *
     * @param string $message  Mensaje actual del usuario
     * @param array  $history  Historial [['role'=>'user|assistant','content'=>'...']]
     * @param array  $context  { userId, userRole, currentPage }
     * @param string $jwt      JWT Bearer del usuario
     *
     * @return array { reply: string, agent: { name: string, id: string } }
     */
    public function process(string $message, array $history, array $context, string $jwt): array
    {
        $agentId = $this->classify($message, $history, $context);
        $agent   = $this->resolveAgent($agentId, $context);

        $reply = $agent->handle($message, $history, $context, $jwt);

        return [
            'reply' => $reply,
            'agent' => [
                'name' => $agent->getName(),
                'id'   => $agent->getId(),
            ],
        ];
    }

    // ──────────────────────────────────────────────────────────────
    // Clasificador de intención
    // ──────────────────────────────────────────────────────────────

    private function classify(string $message, array $history, array $context): string
    {
        $role  = $context['userRole'] ?? 'normal';
        $page  = $context['currentPage'] ?? '';

        $agentDescriptions = implode("\n", [
            '- carmen: proveedores (suppliers) y contratos (contracts)',
            '- rafa: ofertas (offers/quotes) y pedidos/compras (orders/purchases)',
            '- noa: importaciones (imports/shipments)',
            '- iris: muestras (product samples)',
        ]);

        if (in_array($role, ['admin', 'superadmin'], true)) {
            $agentDescriptions .= "\n- alex: usuarios (users/accounts) — solo admin/superadmin";
        }

        // Incluir los últimos 3 mensajes del historial para contexto del clasificador
        $recentHistory = array_slice($history, -3);
        $historyText   = '';
        foreach ($recentHistory as $entry) {
            $r = $entry['role'] ?? 'user';
            $c = $entry['content'] ?? '';
            $historyText .= "\n[{$r}]: {$c}";
        }

        $systemPrompt = <<<PROMPT
Eres un clasificador de intenciones para un sistema SRM (Supplier Relationship Management).
Tu ÚNICA tarea es determinar qué agente debe manejar el mensaje del usuario.

Agentes disponibles:
{$agentDescriptions}

Rol del usuario: {$role}
Página actual en la aplicación: {$page}

Reglas de clasificación:
- Proveedor, fabricante, distribuidor, CIF/NIF, contrato, vigencia, vencimiento → carmen
- Oferta, cotización, precio, pedido, compra, producto ofertado → rafa
- Importación, DUA, arancel, flete, despacho, transitario, tipo de cambio, logística → noa
- Muestra, lote, análisis, calidad, BIO, HALAL, KOSHER, FOOD, evaluación de producto → iris
- Usuario, rol, permiso, cuenta, acceso, contraseña, alta/baja de usuario → alex (solo admin/superadmin)
- Si el mensaje es ambiguo o genérico, usa la página actual como guía
- Por defecto usa "carmen"

Responde ÚNICAMENTE con este JSON (sin texto adicional, sin markdown):
{"agent":"id_del_agente"}
PROMPT;

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        if ($historyText !== '') {
            $messages[] = ['role' => 'user', 'content' => 'Historial reciente:' . $historyText];
        }

        $messages[] = ['role' => 'user', 'content' => 'Nuevo mensaje: ' . $message];

        try {
            $response = $this->httpClient->request('POST', 'https://api.openai.com/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->openAiApiKey,
                    'Content-Type'  => 'application/json',
                ],
                'json' => [
                    'model'       => $this->openAiModel,
                    'messages'    => $messages,
                    'temperature' => 0,
                    'max_tokens'  => 30,
                ],
                'timeout' => 15,
            ]);

            $data    = $response->toArray();
            $content = trim($data['choices'][0]['message']['content'] ?? '{}');

            // Limpiar posible markdown code block
            $content = preg_replace('/^```[a-z]*\n?|\n?```$/i', '', $content);
            $parsed  = json_decode($content, true);

            return $parsed['agent'] ?? 'carmen';
        } catch (\Throwable) {
            return $this->inferAgentFromPage($context);
        }
    }

    /** Fallback heurístico basado en la página actual */
    private function inferAgentFromPage(array $context): string
    {
        $page = strtolower($context['currentPage'] ?? '');

        return match (true) {
            str_contains($page, 'proveedor') || str_contains($page, 'contrato') => 'carmen',
            str_contains($page, 'oferta') || str_contains($page, 'pedido')      => 'rafa',
            str_contains($page, 'importaci')                                    => 'noa',
            str_contains($page, 'muestra')                                      => 'iris',
            str_contains($page, 'usuario')                                      => 'alex',
            default                                                              => 'carmen',
        };
    }

    // ──────────────────────────────────────────────────────────────
    // Resolución del agente
    // ──────────────────────────────────────────────────────────────

    private function resolveAgent(string $agentId, array $context): AgentInterface
    {
        $fallback = null;

        foreach ($this->agents as $agent) {
            // Guardar carmen como fallback
            if ($agent->getId() === 'carmen') {
                $fallback = $agent;
            }

            if ($agent->getId() === $agentId && $agent->supports($context)) {
                return $agent;
            }
        }

        // Si el agente no existe o no tiene permisos, usar carmen
        if ($fallback !== null) {
            return $fallback;
        }

        // Último recurso: el primer agente disponible
        foreach ($this->agents as $agent) {
            return $agent;
        }

        throw new \RuntimeException('No hay agentes registrados en el sistema.');
    }
}

<?php

namespace App\Agent;

use App\Service\SrmApiClient;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Base común para todos los agentes.
 *
 * Implementa un bucle agéntico con OpenAI Function Calling:
 *   1. Envía mensaje + herramientas disponibles a OpenAI.
 *   2. Si OpenAI decide llamar a una herramienta, la ejecutamos contra la API SRM.
 *   3. Devolvemos el resultado a OpenAI y repetimos hasta obtener respuesta final.
 *
 * Cada agente concreto define sus herramientas (getTools) y cómo ejecutarlas (executeTool).
 */
abstract class AbstractAgent implements AgentInterface
{
    /** Máximo de iteraciones del bucle agéntico para evitar bucles infinitos */
    private const MAX_ITERATIONS = 6;

    public function __construct(
        protected readonly SrmApiClient $apiClient,
        protected readonly HttpClientInterface $httpClient,
        protected readonly string $openAiApiKey,
        protected readonly string $openAiModel,
        protected readonly string $agentsPath,
    ) {}

    // ──────────────────────────────────────────────────────────────
    // Carga de personalidad desde archivos .md
    // ──────────────────────────────────────────────────────────────

    /**
     * Lee IDENTITY.md + SOUL.md del directorio del agente y los concatena.
     * Ruta configurada con la variable de entorno AGENTS_PATH.
     */
    protected function loadPersona(string $agentName): string
    {
        $base  = rtrim($this->agentsPath, '/\\');
        $parts = [];

        foreach (['IDENTITY.md', 'SOUL.md'] as $filename) {
            $path = $base . '/' . $agentName . '/' . $filename;
            if (is_file($path)) {
                $content = file_get_contents($path);
                if ($content !== false && trim($content) !== '') {
                    $parts[] = trim($content);
                }
            }
        }

        return $parts !== []
            ? implode("\n\n---\n\n", $parts)
            : "Eres el agente {$agentName} del SRM de Compras.";
    }

    // ──────────────────────────────────────────────────────────────
    // Contrato que deben implementar los agentes concretos
    // ──────────────────────────────────────────────────────────────

    /** Prompt de sistema que define la personalidad y contexto del agente */
    abstract protected function getSystemPrompt(array $context): string;

    /**
     * Definición de herramientas en formato OpenAI Function Calling.
     * @return array<int, array{type: 'function', function: array}>
     */
    abstract protected function getTools(): array;

    /**
     * Ejecuta una herramienta y devuelve el resultado como string (JSON o mensaje).
     */
    abstract protected function executeTool(string $name, array $args, string $jwt): string;

    // ──────────────────────────────────────────────────────────────
    // Lógica compartida — bucle agéntico
    // ──────────────────────────────────────────────────────────────

    public function handle(string $message, array $history, array $context, string $jwt): string
    {
        $messages = [['role' => 'system', 'content' => $this->getSystemPrompt($context)]];

        foreach ($history as $entry) {
            $role    = in_array($entry['role'] ?? '', ['user', 'assistant', 'system'], true)
                ? $entry['role']
                : 'user';
            $content = (string) ($entry['content'] ?? '');
            if ($content !== '') {
                $messages[] = ['role' => $role, 'content' => $content];
            }
        }

        $messages[] = ['role' => 'user', 'content' => $message];
        $tools      = $this->getTools();

        for ($i = 0; $i < self::MAX_ITERATIONS; $i++) {
            $response = $this->httpClient->request('POST', 'https://api.openai.com/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . trim($this->openAiApiKey),
                    'Content-Type'  => 'application/json',
                ],
                'json' => [
                    'model'       => $this->openAiModel,
                    'messages'    => $messages,
                    'tools'       => $tools,
                    'tool_choice' => 'auto',
                    'temperature' => 0.3,
                    'max_tokens'  => 2000,
                ],
                'timeout' => 45,
            ]);

            $data         = $response->toArray();
            $choice       = $data['choices'][0] ?? [];
            $assistantMsg = $choice['message'] ?? [];
            $finishReason = $choice['finish_reason'] ?? 'stop';
            $toolCalls    = $assistantMsg['tool_calls'] ?? [];

            // Añadir mensaje del asistente al historial de la conversación
            $messages[] = $assistantMsg;

            // Si no hay llamadas a herramientas → respuesta final en lenguaje natural
            if ($finishReason === 'stop' || empty($toolCalls)) {
                return $assistantMsg['content']
                    ?? 'Lo siento, no pude generar una respuesta en este momento.';
            }

            // Ejecutar cada tool_call y añadir el resultado al historial
            foreach ($toolCalls as $toolCall) {
                $toolName   = $toolCall['function']['name'] ?? '';
                $args       = json_decode($toolCall['function']['arguments'] ?? '{}', true) ?? [];
                $toolResult = $this->executeTool($toolName, $args, $jwt);

                $messages[] = [
                    'role'         => 'tool',
                    'tool_call_id' => $toolCall['id'],
                    'name'         => $toolName,
                    'content'      => $toolResult,
                ];
            }
        }

        return 'No pude completar la operación. Por favor, inténtalo de nuevo.';
    }

    public function supports(array $context): bool
    {
        return true;
    }

    // ──────────────────────────────────────────────────────────────
    // Helpers compartidos
    // ──────────────────────────────────────────────────────────────

    /** Serializa un valor a JSON legible */
    protected function toJson(mixed $data): string
    {
        return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) ?: '[]';
    }

    /** Helper para construir una definición de función OpenAI */
    protected function tool(string $name, string $description, array $properties, array $required = []): array
    {
        return [
            'type'     => 'function',
            'function' => [
                'name'        => $name,
                'description' => $description,
                // OpenAI requiere que "properties" y "required" sean objeto/array JSON válidos.
                // Un array PHP vacío [] se serializa como "[]" (array JSON), no "{}".
                // (object) fuerza la codificación como objeto "{}" cuando está vacío.
                'parameters'  => [
                    'type'       => 'object',
                    'properties' => $properties !== [] ? $properties : new \stdClass(),
                    'required'   => array_values($required),
                ],
            ],
        ];
    }

    /** Helper para campos de tipo string */
    protected function strProp(string $description, ?array $enum = null): array
    {
        $prop = ['type' => 'string', 'description' => $description];
        if ($enum !== null) {
            $prop['enum'] = $enum;
        }

        return $prop;
    }

    /** Helper para campos numéricos */
    protected function numProp(string $description): array
    {
        return ['type' => 'number', 'description' => $description];
    }

    /** Helper para campos booleanos */
    protected function boolProp(string $description): array
    {
        return ['type' => 'boolean', 'description' => $description];
    }
}

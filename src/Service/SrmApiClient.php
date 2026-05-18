<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\HttpKernelInterface;

/**
 * Cliente interno para acceder a la propia API REST del SRM.
 *
 * Usa sub-requests del kernel de Symfony en lugar de llamadas HTTP externas,
 * evitando deadlocks cuando el agente llama al mismo servidor que lo está procesando.
 */
class SrmApiClient
{
    public function __construct(
        private readonly HttpKernelInterface $kernel,
    ) {}

    /**
     * Realiza una petición GET autenticada (sub-request interno).
     *
     * @return array El array decodificado de la respuesta, o [] en caso de error.
     */
    public function get(string $path, string $jwt): array
    {
        return $this->internalRequest('GET', $path, $jwt);
    }

    /**
     * Realiza una petición POST autenticada (sub-request interno).
     *
     * @return array El array decodificado de la respuesta.
     */
    public function post(string $path, string $jwt, array $body): array
    {
        return $this->internalRequest('POST', $path, $jwt, $body);
    }

    /**
     * Realiza una petición PUT autenticada (sub-request interno).
     *
     * @return array El array decodificado de la respuesta.
     */
    public function put(string $path, string $jwt, array $body): array
    {
        return $this->internalRequest('PUT', $path, $jwt, $body);
    }

    /**
     * Realiza una petición DELETE autenticada (sub-request interno).
     */
    public function delete(string $path, string $jwt): bool
    {
        $result = $this->internalRequest('DELETE', $path, $jwt);
        // delete devuelve array vacío en éxito (204 No Content) o ['error'=>...] en fallo
        return !isset($result['error']);
    }

    // ──────────────────────────────────────────────────────────────
    // Implementación interna — no hace ninguna llamada de red
    // ──────────────────────────────────────────────────────────────

    private function internalRequest(string $method, string $path, string $jwt, array $body = []): array
    {
        try {
            $content = $body !== [] ? json_encode($body, \JSON_THROW_ON_ERROR) : null;

            $server = [
                'HTTP_AUTHORIZATION' => 'Bearer ' . $jwt,
                'HTTP_ACCEPT'        => 'application/json',
            ];

            if ($content !== null) {
                $server['CONTENT_TYPE']   = 'application/json';
                $server['CONTENT_LENGTH'] = strlen($content);
            }

            $request  = Request::create($path, $method, [], [], [], $server, $content);
            $response = $this->kernel->handle($request, HttpKernelInterface::SUB_REQUEST, false);

            $statusCode = $response->getStatusCode();

            if ($statusCode === 204) {
                // No Content (DELETE exitoso)
                return [];
            }

            if ($statusCode >= 400) {
                $decoded = json_decode($response->getContent(), true);
                return ['error' => $decoded['error'] ?? 'HTTP ' . $statusCode];
            }

            return json_decode($response->getContent(), true) ?? [];
        } catch (\Throwable $e) {
            return ['error' => $e->getMessage()];
        }
    }
}


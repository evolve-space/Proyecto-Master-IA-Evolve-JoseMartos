<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class MicrosoftGraphAuthService
{
    private ?string $cachedAppToken = null;
    private int $cachedAppTokenExpiresAt = 0;

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly MicrosoftGraphOAuthService $oauthService,
    ) {
    }

    public function usesDelegatedAuth(): bool
    {
        return $this->oauthService->hasConnection();
    }

    public function getAccessToken(): string
    {
        if ($this->oauthService->hasConnection()) {
            return $this->oauthService->getValidAccessToken();
        }

        return $this->getApplicationAccessToken();
    }

    public function getApplicationAccessToken(): string
    {
        $now = time();
        if ($this->cachedAppToken !== null && $now < $this->cachedAppTokenExpiresAt) {
            return $this->cachedAppToken;
        }

        $tenantId = trim((string) ($_ENV['MS_GRAPH_TENANT_ID'] ?? ''));
        $clientId = trim((string) ($_ENV['MS_GRAPH_CLIENT_ID'] ?? ''));
        $clientSecret = trim((string) ($_ENV['MS_GRAPH_CLIENT_SECRET'] ?? ''));

        if ($tenantId === '' || $clientId === '' || $clientSecret === '') {
            throw new \RuntimeException('Faltan variables MS_GRAPH_TENANT_ID / CLIENT_ID / CLIENT_SECRET.');
        }

        $tokenUrl = sprintf('https://login.microsoftonline.com/%s/oauth2/v2.0/token', rawurlencode($tenantId));
        $response = $this->httpClient->request('POST', $tokenUrl, [
            'headers' => ['Content-Type' => 'application/x-www-form-urlencoded'],
            'body' => http_build_query([
                'grant_type' => 'client_credentials',
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'scope' => 'https://graph.microsoft.com/.default',
            ]),
        ]);

        $data = $response->toArray(false);
        if (($response->getStatusCode() ?? 500) >= 400) {
            $error = (string) ($data['error_description'] ?? $data['error'] ?? 'Error obteniendo token Graph');
            throw new \RuntimeException($error);
        }

        $token = (string) ($data['access_token'] ?? '');
        $expiresIn = (int) ($data['expires_in'] ?? 3600);
        if ($token === '') {
            throw new \RuntimeException('Graph no devolvio access_token.');
        }

        $this->cachedAppToken = $token;
        $this->cachedAppTokenExpiresAt = time() + max(60, $expiresIn - 60);

        return $token;
    }
}

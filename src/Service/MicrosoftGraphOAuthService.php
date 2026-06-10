<?php

namespace App\Service;

use App\Entity\OutlookConnection;
use App\Repository\OutlookConnectionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class MicrosoftGraphOAuthService
{
    private const SCOPES = 'openid profile offline_access User.Read Mail.Read Mail.ReadWrite Mail.Send Calendars.Read Calendars.ReadWrite';

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly OutlookConnectionRepository $connectionRepository,
        private readonly EntityManagerInterface $em,
        private readonly CacheInterface $cache,
    ) {
    }

    public function hasConnection(): bool
    {
        return $this->connectionRepository->findLatest() !== null;
    }

    public function getConnection(): ?OutlookConnection
    {
        return $this->connectionRepository->findLatest();
    }

    /**
     * @return array{url: string, state: string}
     */
    public function createAuthorizationUrl(bool $forceConsent = false, ?string $returnTo = null, bool $popup = false): array
    {
        $clientId = $this->clientId();
        $redirectUri = $this->redirectUri();
        $state = bin2hex(random_bytes(16));

        $this->cache->delete('ms_oauth_state_'.$state);
        $this->cache->get('ms_oauth_state_'.$state, static function (ItemInterface $item) use ($returnTo, $popup) {
            $item->expiresAfter(600);

            return [
                'returnTo' => $returnTo ?? 'correos',
                'popup' => $popup,
            ];
        });

        $params = [
            'client_id' => $clientId,
            'response_type' => 'code',
            'redirect_uri' => $redirectUri,
            'response_mode' => 'query',
            'scope' => self::SCOPES,
            'state' => $state,
        ];

        if ($forceConsent) {
            $params['prompt'] = 'consent';
        }

        $query = http_build_query($params);

        return [
            'url' => $this->authorizeBaseUrl().'/oauth2/v2.0/authorize?'.$query,
            'state' => $state,
        ];
    }

    public function validateState(?string $state): bool
    {
        if ($state === null || $state === '') {
            return false;
        }

        return $this->cache->getItem('ms_oauth_state_'.$state)->isHit();
    }

    /**
     * @return array{returnTo: string, popup: bool}|null
     */
    public function consumeOAuthContext(?string $state): ?array
    {
        if ($state === null || $state === '') {
            return null;
        }

        $key = 'ms_oauth_state_'.$state;
        $item = $this->cache->getItem($key);
        if (!$item->isHit()) {
            return null;
        }

        $this->cache->delete($key);
        $value = $item->get();

        if (is_string($value) && $value !== '') {
            return ['returnTo' => $value, 'popup' => false];
        }

        if (is_array($value)) {
            $returnTo = trim((string) ($value['returnTo'] ?? 'correos'));

            return [
                'returnTo' => in_array($returnTo, ['correos', 'calendario'], true) ? $returnTo : 'correos',
                'popup' => (bool) ($value['popup'] ?? false),
            ];
        }

        return null;
    }

    public function exchangeAuthorizationCode(string $code): OutlookConnection
    {
        $data = $this->requestToken([
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => $this->redirectUri(),
        ]);

        return $this->persistTokens($data);
    }

    public function getValidAccessToken(): string
    {
        $connection = $this->connectionRepository->findLatest();
        if ($connection === null) {
            throw new \RuntimeException('Outlook no conectado. Usa «Conectar Outlook» en la pantalla de Correos.');
        }

        if (!$connection->isExpired()) {
            return $connection->getAccessToken();
        }

        $data = $this->requestToken([
            'grant_type' => 'refresh_token',
            'refresh_token' => $connection->getRefreshToken(),
        ]);

        $connection = $this->persistTokens($data, $connection);

        return $connection->getAccessToken();
    }

    public function disconnect(): void
    {
        foreach ($this->connectionRepository->findAll() as $connection) {
            $this->em->remove($connection);
        }
        $this->em->flush();
    }

    /**
     * @param array<string, mixed> $body
     *
     * @return array<string, mixed>
     */
    private function requestToken(array $body): array
    {
        $response = $this->httpClient->request('POST', $this->authorizeBaseUrl().'/oauth2/v2.0/token', [
            'headers' => ['Content-Type' => 'application/x-www-form-urlencoded'],
            'body' => http_build_query($body + [
                'client_id' => $this->clientId(),
                'client_secret' => $this->clientSecret(),
            ]),
        ]);

        $data = $response->toArray(false);
        if ($response->getStatusCode() >= 400) {
            $error = (string) ($data['error_description'] ?? $data['error'] ?? 'Error obteniendo token OAuth');
            throw new \RuntimeException($error);
        }

        return $data;
    }

    /**
     * @param array<string, mixed> $data
     */
    private function persistTokens(array $data, ?OutlookConnection $existing = null): OutlookConnection
    {
        $accessToken = (string) ($data['access_token'] ?? '');
        $refreshToken = (string) ($data['refresh_token'] ?? $existing?->getRefreshToken() ?? '');
        $expiresIn = (int) ($data['expires_in'] ?? 3600);

        if ($accessToken === '' || $refreshToken === '') {
            throw new \RuntimeException('Microsoft no devolvio tokens validos.');
        }

        $connection = $existing ?? new OutlookConnection();
        $connection
            ->setAccessToken($accessToken)
            ->setRefreshToken($refreshToken)
            ->setExpiresAt(new \DateTimeImmutable('+'.max(60, $expiresIn - 60).' seconds'))
            ->setUpdatedAt(new \DateTimeImmutable());

        $email = $this->fetchAccountEmail($accessToken);
        if ($email !== '') {
            $connection->setAccountEmail($email);
        } elseif ($connection->getAccountEmail() === '') {
            $connection->setAccountEmail('outlook@conectado');
        }

        $this->em->persist($connection);
        $this->em->flush();

        return $connection;
    }

    private function fetchAccountEmail(string $accessToken): string
    {
        $response = $this->httpClient->request('GET', 'https://graph.microsoft.com/v1.0/me', [
            'headers' => [
                'Authorization' => 'Bearer '.$accessToken,
                'Accept' => 'application/json',
            ],
        ]);

        if ($response->getStatusCode() >= 400) {
            return '';
        }

        $data = $response->toArray(false);

        return trim((string) ($data['mail'] ?? $data['userPrincipalName'] ?? ''));
    }

    private function clientId(): string
    {
        $clientId = trim((string) ($_ENV['MS_GRAPH_CLIENT_ID'] ?? ''));
        if ($clientId === '') {
            throw new \RuntimeException('Falta MS_GRAPH_CLIENT_ID.');
        }

        return $clientId;
    }

    private function clientSecret(): string
    {
        $secret = trim((string) ($_ENV['MS_GRAPH_CLIENT_SECRET'] ?? ''));
        if ($secret === '') {
            throw new \RuntimeException('Falta MS_GRAPH_CLIENT_SECRET.');
        }

        return $secret;
    }

    private function redirectUri(): string
    {
        $uri = rtrim(trim((string) ($_ENV['MS_GRAPH_REDIRECT_URI'] ?? '')), '/');

        if ($uri === '') {
            $base = rtrim(trim((string) ($_ENV['DEFAULT_URI'] ?? '')), '/');
            if ($base !== '') {
                $uri = $base.'/api/outlook/oauth/callback';
            }
        }

        if ($uri === '') {
            throw new \RuntimeException(
                'Falta MS_GRAPH_REDIRECT_URI o DEFAULT_URI (ej. https://tu-backend.up.railway.app/api/outlook/oauth/callback).'
            );
        }

        return $uri;
    }

    private function authorizeBaseUrl(): string
    {
        $tenant = trim((string) ($_ENV['MS_GRAPH_OAUTH_TENANT'] ?? 'common'));
        if ($tenant === '') {
            $tenant = 'common';
        }

        return 'https://login.microsoftonline.com/'.rawurlencode($tenant);
    }
}

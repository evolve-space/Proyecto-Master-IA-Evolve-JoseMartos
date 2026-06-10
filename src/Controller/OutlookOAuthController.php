<?php

namespace App\Controller;

use App\Service\MicrosoftGraphAuthService;
use App\Service\MicrosoftGraphOAuthService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/outlook/oauth', name: 'api_outlook_oauth_')]
class OutlookOAuthController extends AbstractController
{
    #[Route('/connect', name: 'connect', methods: ['GET'])]
    public function connect(Request $request, MicrosoftGraphOAuthService $oauthService): JsonResponse
    {
        try {
            $forceConsent = filter_var($request->query->get('consent', false), FILTER_VALIDATE_BOOLEAN);
            $popup = filter_var($request->query->get('popup', true), FILTER_VALIDATE_BOOLEAN);
            $returnTo = $request->query->get('return');
            $returnPath = is_string($returnTo) && preg_match('/^[a-z0-9_-]+$/i', $returnTo) ? $returnTo : null;
            $auth = $oauthService->createAuthorizationUrl($forceConsent, $returnPath, $popup);

            return $this->json([
                'url' => $auth['url'],
            ]);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/callback', name: 'callback', methods: ['GET'])]
    public function callback(Request $request, MicrosoftGraphOAuthService $oauthService): Response
    {
        $frontend = $this->frontendUrl();
        $state = $request->query->get('state');
        $context = $oauthService->consumeOAuthContext(is_string($state) ? $state : null);
        $returnTo = $context['returnTo'] ?? 'correos';

        $error = $request->query->get('error');
        if (is_string($error) && $error !== '') {
            $description = (string) $request->query->get('error_description', $error);

            return $this->oauthCompletionPage($frontend, 'error', $description, $returnTo);
        }

        if ($context === null) {
            return $this->oauthCompletionPage(
                $frontend,
                'error',
                'Estado OAuth invalido. Vuelve a intentarlo.',
                'correos',
            );
        }

        $code = $request->query->get('code');
        if (!is_string($code) || $code === '') {
            return $this->oauthCompletionPage(
                $frontend,
                'error',
                'Microsoft no devolvio codigo de autorizacion.',
                $returnTo,
            );
        }

        try {
            $oauthService->exchangeAuthorizationCode($code);
        } catch (\Throwable $e) {
            return $this->oauthCompletionPage($frontend, 'error', $e->getMessage(), $returnTo);
        }

        return $this->oauthCompletionPage($frontend, 'connected', null, $returnTo);
    }

    #[Route('/status', name: 'status', methods: ['GET'])]
    public function status(
        MicrosoftGraphOAuthService $oauthService,
        MicrosoftGraphAuthService $authService,
    ): JsonResponse {
        $connection = $oauthService->getConnection();

        return $this->json([
            'connected' => $connection !== null,
            'email' => $connection?->getAccountEmail(),
            'mode' => $authService->usesDelegatedAuth() ? 'delegated' : 'application',
            'updatedAt' => $connection?->getUpdatedAt()->format(\DATE_ATOM),
        ]);
    }

    #[Route('/disconnect', name: 'disconnect', methods: ['POST'])]
    public function disconnect(MicrosoftGraphOAuthService $oauthService): JsonResponse
    {
        $oauthService->disconnect();

        return $this->json(['ok' => true, 'connected' => false]);
    }

    private function frontendUrl(): string
    {
        return rtrim(trim((string) ($_ENV['MS_GRAPH_FRONTEND_URL'] ?? 'http://localhost:5173')), '/');
    }

    /**
     * Evita redirigir a rutas SPA (/correos, /login) que en Vercel devuelven 404 al cargar directo.
     * Popup: postMessage al opener y cierre. Pestaña normal: redirige a /?outlook=...
     */
    private function oauthCompletionPage(
        string $frontend,
        string $status,
        ?string $message,
        string $returnTo,
    ): Response {
        $payload = json_encode([
            'type' => 'outlook-oauth',
            'status' => $status,
            'message' => $message,
            'returnTo' => $returnTo,
        ], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);

        $frontendJson = json_encode($frontend, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
        $title = $status === 'connected' ? 'Outlook conectado' : 'Error al conectar Outlook';
        $userMessage = $status === 'connected'
            ? 'Outlook conectado correctamente.'
            : ($message ?? 'No se pudo conectar Outlook.');

        $html = <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{$title}</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 2rem; color: #1a1a1a; }
    </style>
</head>
<body>
    <p id="msg">{$this->escapeHtml($userMessage)}</p>
    <script>
    (function () {
        var target = {$frontendJson};
        var payload = {$payload};
        if (window.opener && !window.opener.closed) {
            try { window.opener.postMessage(payload, target); } catch (e) {}
            window.close();
            setTimeout(function () {
                document.getElementById('msg').textContent = 'Puedes cerrar esta ventana.';
            }, 300);
            return;
        }
        var q = new URLSearchParams();
        q.set('outlook', payload.status);
        if (payload.message) { q.set('message', payload.message); }
        if (payload.returnTo) { q.set('return', payload.returnTo); }
        window.location.replace(target + '/?' + q.toString());
    })();
    </script>
</body>
</html>
HTML;

        return new Response($html, Response::HTTP_OK, ['Content-Type' => 'text/html; charset=UTF-8']);
    }

    private function escapeHtml(string $text): string
    {
        return htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}

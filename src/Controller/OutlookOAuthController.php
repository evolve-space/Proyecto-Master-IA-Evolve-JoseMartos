<?php

namespace App\Controller;

use App\Service\MicrosoftGraphAuthService;
use App\Service\MicrosoftGraphOAuthService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/outlook/oauth', name: 'api_outlook_oauth_')]
class OutlookOAuthController extends AbstractController
{
    #[Route('/connect', name: 'connect', methods: ['GET'])]
    public function connect(Request $request, MicrosoftGraphOAuthService $oauthService): JsonResponse
    {
        try {
            $forceConsent = filter_var($request->query->get('consent', false), FILTER_VALIDATE_BOOLEAN);
            $returnTo = $request->query->get('return');
            $returnPath = is_string($returnTo) && preg_match('/^[a-z0-9_-]+$/i', $returnTo) ? $returnTo : null;
            $auth = $oauthService->createAuthorizationUrl($forceConsent, $returnPath);

            return $this->json([
                'url' => $auth['url'],
            ]);
        } catch (\Throwable $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/callback', name: 'callback', methods: ['GET'])]
    public function callback(Request $request, MicrosoftGraphOAuthService $oauthService): RedirectResponse
    {
        $frontend = rtrim(trim((string) ($_ENV['MS_GRAPH_FRONTEND_URL'] ?? 'http://localhost:5173')), '/');
        $state = $request->query->get('state');
        $returnTo = $oauthService->consumeOAuthReturnTo(is_string($state) ? $state : null);
        $redirectPath = in_array($returnTo, ['correos', 'calendario'], true) ? $returnTo : 'correos';

        $error = $request->query->get('error');
        if (is_string($error) && $error !== '') {
            $description = (string) $request->query->get('error_description', $error);

            return new RedirectResponse($frontend.'/'.$redirectPath.'?outlook=error&message='.rawurlencode($description));
        }

        if ($returnTo === null) {
            return new RedirectResponse($frontend.'/correos?outlook=error&message='.rawurlencode('Estado OAuth invalido. Vuelve a intentarlo.'));
        }

        $code = $request->query->get('code');
        if (!is_string($code) || $code === '') {
            return new RedirectResponse($frontend.'/'.$redirectPath.'?outlook=error&message='.rawurlencode('Microsoft no devolvio codigo de autorizacion.'));
        }

        try {
            $oauthService->exchangeAuthorizationCode($code);
        } catch (\Throwable $e) {
            return new RedirectResponse($frontend.'/'.$redirectPath.'?outlook=error&message='.rawurlencode($e->getMessage()));
        }

        return new RedirectResponse($frontend.'/'.$redirectPath.'?outlook=connected');
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
}

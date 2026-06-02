<?php

namespace App\Command;

use App\Service\MicrosoftGraphAuthService;
use App\Service\MicrosoftGraphMailService;
use App\Service\MicrosoftGraphOAuthService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:graph-test',
    description: 'Comprueba token y acceso al buzón de Microsoft Graph',
)]
class GraphTestCommand extends Command
{
    public function __construct(
        private readonly MicrosoftGraphAuthService $authService,
        private readonly MicrosoftGraphMailService $mailService,
        private readonly MicrosoftGraphOAuthService $oauthService,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Diagnóstico Microsoft Graph');

        if ($this->oauthService->hasConnection()) {
            $connection = $this->oauthService->getConnection();
            $io->success(sprintf(
                'Modo delegado: cuenta conectada %s',
                $connection?->getAccountEmail() ?? '(sin email)',
            ));
        } else {
            $io->warning('Sin conexión OAuth. En la app: Correos → Conectar Outlook (Hotmail/Outlook/M365).');
            $io->note('O configura MS_GRAPH_MAILBOX_USER con un buzón M365 y permisos de aplicación en Azure.');
        }

        try {
            $token = $this->authService->getAccessToken();
            $io->success('Token obtenido ('.strlen($token).' caracteres).');
        } catch (\Throwable $e) {
            $io->error('No se pudo obtener token: '.$e->getMessage());

            return Command::FAILURE;
        }

        try {
            $messages = $this->mailService->listInboxMessages(1);
            $io->success(sprintf('Acceso al buzón OK (%d mensaje(s) en la prueba).', count($messages)));

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $io->error($e->getMessage());

            if (!$this->oauthService->hasConnection()) {
                $io->note('Conecta primero: abre la app → Correos → «Conectar Outlook».');
            }

            return Command::FAILURE;
        }
    }
}

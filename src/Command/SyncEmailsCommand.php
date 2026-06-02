<?php

namespace App\Command;

use App\Service\EmailGraphSyncService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:sync-emails',
    description: 'Sincroniza correos desde Outlook (Microsoft Graph) a la base de datos',
)]
class SyncEmailsCommand extends Command
{
    public function __construct(
        private readonly EmailGraphSyncService $syncService,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('top', null, InputOption::VALUE_REQUIRED, 'Solo los N correos mas recientes (sin esta opcion: importa todo el buzon)')
            ->addOption('attachments', null, InputOption::VALUE_NONE, 'Consultar metadatos de adjuntos en Graph (mas lento)');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $topRaw = $input->getOption('top');
        $all = $topRaw === null;
        $top = $all ? 50 : (int) $topRaw;
        $includeAttachments = (bool) $input->getOption('attachments');

        if ($all) {
            $io->writeln('Importando todos los correos de la bandeja de entrada...');
        } else {
            $io->note(sprintf('Modo parcial: solo los ultimos %d correos.', $top));
        }

        try {
            $result = $this->syncService->sync($all, $top, $includeAttachments);
        } catch (\Throwable $e) {
            $io->error($e->getMessage());

            return Command::FAILURE;
        }

        $io->success(sprintf(
            'Sync completa. fetched=%d, imported=%d, duplicated=%d, failed=%d',
            $result['fetched'],
            $result['imported'],
            $result['duplicated'],
            $result['failed'],
        ));

        if ($result['errors'] !== []) {
            $io->warning(sprintf('%d errores durante la importacion.', count($result['errors'])));
        }

        return Command::SUCCESS;
    }
}

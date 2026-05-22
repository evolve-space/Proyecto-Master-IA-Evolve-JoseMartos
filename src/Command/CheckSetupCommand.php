<?php

namespace App\Command;

use App\Entity\Usuario;
use App\Repository\UsuarioRepository;
use Doctrine\DBAL\Connection;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:check-setup',
    description: 'Comprueba conexión a MySQL y el usuario superadmin',
)]
class CheckSetupCommand extends Command
{
    public function __construct(
        private Connection $connection,
        private UsuarioRepository $usuarios,
        private UserPasswordHasherInterface $hasher,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('Diagnóstico SRM Compras (local)');

        try {
            $this->connection->executeQuery('SELECT 1');
            $db = $this->connection->getDatabase();
            $io->success(sprintf('Conexión MySQL OK (base de datos: %s).', $db));
        } catch (\Throwable $e) {
            $io->error('Symfony NO puede conectar a MySQL.');
            $io->text($e->getMessage());
            $io->section('Qué hacer');
            $io->listing([
                'Crea el archivo .env.local en la raíz del proyecto.',
                'Pon la MISMA contraseña de root que usas en MySQL Workbench.',
                'Ejemplo: DATABASE_URL="mysql://root:TU_PASSWORD@127.0.0.1:3306/srm_compras?serverVersion=8.0&charset=utf8mb4"',
                'Reinicia symfony server:start después de guardar.',
            ]);

            return Command::FAILURE;
        }

        $user = $this->usuarios->findOneByLoginIdentifier('superadmin')
            ?? $this->usuarios->findOneByLoginIdentifier('superadmin@srm.local');

        if (!$user instanceof Usuario) {
            $io->warning('Conectado a MySQL, pero no hay usuario superadmin en la tabla usuario.');
            $io->text('Ejecuta: php bin/console app:load-sample-data');

            return Command::FAILURE;
        }

        $io->success(sprintf(
            'Usuario encontrado: id=%d, username=%s, email=%s',
            $user->getId(),
            $user->getUsername(),
            $user->getEmail() ?? '(sin email)',
        ));

        $plainOk = $this->hasher->isPasswordValid($user, 'superadmin');
        if ($plainOk) {
            $io->success('La contraseña "superadmin" coincide con el hash en la base de datos.');
            $io->text('Login JSON de prueba: {"email":"superadmin","password":"superadmin"}');

            return Command::SUCCESS;
        }

        $io->warning('El usuario existe, pero la contraseña en BD NO es "superadmin" (o no está hasheada).');
        $io->text('Ejecuta: php bin/console app:load-sample-data  (regenera usuarios con contraseñas correctas)');

        return Command::FAILURE;
    }
}

<?php

require dirname(__DIR__) . '/vendor/autoload.php';
(new Symfony\Component\Dotenv\Dotenv())->bootEnv(dirname(__DIR__) . '/.env');

$user = $_ENV['DATABASE_USER'] ?? 'root';
$pass = $_ENV['DATABASE_PASSWORD'] ?? '';
$db = $_ENV['DATABASE_NAME'] ?? 'srm_compras';
$port = $_ENV['DATABASE_PORT'] ?? '3306';

$dsns = [
    "mysql:host=127.0.0.1;port={$port};dbname={$db};charset=utf8mb4",
    "mysql:host=localhost;port={$port};dbname={$db};charset=utf8mb4",
    "mysql:unix_socket=\\\\.\\pipe\\MySQL;dbname={$db};charset=utf8mb4",
    "mysql:unix_socket=\\\\.\\pipe\\MySQL80;dbname={$db};charset=utf8mb4",
];

foreach ($dsns as $dsn) {
    try {
        new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        echo "OK {$dsn}\n";
        exit(0);
    } catch (Throwable $e) {
        echo "FAIL {$dsn} -> {$e->getMessage()}\n";
    }
}

exit(1);

<?php

/**
 * Router para el servidor embebido de PHP (Docker / Railway).
 * Sin esto, /api/* devuelve 404 y el preflight CORS (OPTIONS) nunca llega a Symfony.
 */
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$file = __DIR__ . $path;

if ($path !== '/' && is_file($file)) {
    return false;
}

require __DIR__ . '/index.php';

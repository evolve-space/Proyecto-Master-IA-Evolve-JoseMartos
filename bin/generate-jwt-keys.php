<?php

$dir = dirname(__DIR__) . '/config/jwt';
if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

$config = [
    'private_key_bits' => 4096,
    'private_key_type' => OPENSSL_KEYTYPE_RSA,
];

$key = openssl_pkey_new($config);
if ($key === false) {
    fwrite(STDERR, 'openssl_pkey_new failed: ' . openssl_error_string() . PHP_EOL);
    exit(1);
}

if (!openssl_pkey_export($key, $privateKey)) {
    fwrite(STDERR, 'export private failed: ' . openssl_error_string() . PHP_EOL);
    exit(1);
}

$details = openssl_pkey_get_details($key);
$publicKey = $details['key'] ?? null;
if (!$publicKey) {
    fwrite(STDERR, 'export public failed' . PHP_EOL);
    exit(1);
}

file_put_contents($dir . '/private.pem', $privateKey);
file_put_contents($dir . '/public.pem', $publicKey);

echo "JWT keys written to config/jwt/ (sin passphrase)\n";

#!/bin/sh

export APP_ENV="${APP_ENV:-prod}"
export APP_DEBUG="${APP_DEBUG:-0}"

echo "==> SRM Compras API — arranque (APP_ENV=$APP_ENV)"

if [ ! -f .env ]; then
    echo "ERROR: falta .env en la imagen. Reconstruye el contenedor." >&2
    exit 1
fi

echo "==> Limpiando caché Symfony"
php bin/console cache:clear --env=prod --no-warmup
php bin/console cache:warmup --env=prod

echo "==> Migraciones de base de datos"
if ! php bin/console doctrine:migrations:migrate --no-interaction --env=prod; then
    echo "WARN: migraciones fallaron. Revisa DATABASE_URL en Railway. El servidor arranca igual." >&2
fi

PORT="${PORT:-8000}"
echo "==> Servidor HTTP en 0.0.0.0:$PORT"
exec php -S "0.0.0.0:$PORT" -t public public/router.php

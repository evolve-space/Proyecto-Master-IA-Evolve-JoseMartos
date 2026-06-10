#!/bin/sh
set -e

if [ ! -f .env ]; then
    cp .env.dist .env
fi

export APP_ENV="${APP_ENV:-prod}"
export APP_DEBUG="${APP_DEBUG:-0}"

php bin/console cache:clear --env=prod --no-warmup
php bin/console cache:warmup --env=prod
php bin/console doctrine:migrations:migrate --no-interaction --env=prod

exec php -S "0.0.0.0:${PORT:-8000}" -t public

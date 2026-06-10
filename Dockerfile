FROM php:8.2-cli

RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip libzip-dev libicu-dev \
    && docker-php-ext-install zip intl pdo pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    APP_ENV=prod \
    APP_DEBUG=0

WORKDIR /app

# Capa de dependencias (mejor caché en rebuilds)
COPY composer.json composer.lock symfony.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --no-autoloader

COPY . .

RUN composer dump-autoload --optimize --no-dev --classmap-authoritative \
    && chmod +x bin/railway-start.sh

EXPOSE 8000

CMD ["sh", "bin/railway-start.sh"]

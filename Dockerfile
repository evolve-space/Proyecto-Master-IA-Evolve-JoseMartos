FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libicu-dev \
    && docker-php-ext-install zip intl pdo pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /app

COPY . .

RUN composer install --no-dev --no-scripts --no-interaction && \
    composer dump-autoload --optimize --no-dev

CMD php bin/console cache:clear --env=prod ; \
    php bin/console cache:warmup --env=prod ; \
    php bin/console doctrine:migrations:migrate --no-interaction --env=prod ; \
    php -S 0.0.0.0:$PORT -t public

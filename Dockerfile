FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libicu-dev \
    && docker-php-ext-install zip intl pdo pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock symfony.lock* ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

COPY . .
RUN composer dump-autoload --optimize --no-dev

EXPOSE 8080

CMD php bin/console cache:warmup --env=prod ; \
    php bin/console doctrine:migrations:migrate --no-interaction --env=prod ; \
    php -S 0.0.0.0:8080 -t public/

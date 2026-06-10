FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libicu-dev \
    && docker-php-ext-install zip intl pdo pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1
ENV APP_ENV=prod
ENV APP_DEBUG=0
# OPENAI_API_KEY debe pasarse como variable de entorno al arrancar el contenedor
# (docker run -e OPENAI_API_KEY=sk-proj-... o en el panel de Railway/variables de entorno)
# NUNCA pongas la clave directamente aquí.

WORKDIR /app

COPY . .

RUN composer install --no-dev --no-scripts --no-interaction && \
    composer dump-autoload --optimize --no-dev && \
    cp .env.dist .env && \
    chmod +x bin/railway-start.sh

CMD ["sh", "bin/railway-start.sh"]

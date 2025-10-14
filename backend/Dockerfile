FROM php:8.1-apache

# Instalar extensiones de PHP necesarias
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_mysql zip

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar directorio de trabajo
WORKDIR /var/www/html

# Copiar archivos del proyecto
COPY . .

# Instalar dependencias
RUN composer install --no-dev --optimize-autoloader

# Configurar Apache
RUN a2enmod rewrite
COPY .htaccess /var/www/html/.htaccess

# Configurar permisos
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Crear directorios necesarios
RUN mkdir -p /var/www/html/uploads \
    && mkdir -p /var/www/html/logs \
    && chown -R www-data:www-data /var/www/html/uploads \
    && chown -R www-data:www-data /var/www/html/logs

# Exponer puerto
EXPOSE 8000

# Comando para iniciar el servidor
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]

FROM php:8.2-apache

# Kopiraj sve datoteke u Apache root
COPY . /var/www/html/

# Omogući mod_rewrite (nije obavezno, ali korisno)
RUN a2enmod rewrite

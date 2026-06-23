#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Run database migrations automatically on deployment
php artisan migrate --force

# Optimize configuration and route loading for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start supervisor
exec supervisord -c /etc/supervisor/supervisord.conf

# MineTrack Deployment Notes

## Production Requirements

- PHP 8.3+
- Composer
- Node.js 20+
- MySQL or MariaDB
- Web server with SSL
- Writable `storage` and `bootstrap/cache`
- Daily database and storage backups

## First Deploy

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Set production values in `.env`:

```text
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.example
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=minetrack
DB_USERNAME=...
DB_PASSWORD=...
SANCTUM_STATEFUL_DOMAINS=your-domain.example
SESSION_DOMAIN=your-domain.example
```

## Backups

Back up both:

- MySQL/MariaDB database
- `storage/app/public`

Suggested frequency: daily, with at least 7 retained backups.

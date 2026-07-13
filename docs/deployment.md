# MineTrack Deployment Notes

## Production Requirements

- PHP 8.3+
- Composer
- Node.js 20+
- MySQL or MariaDB
- Web server with SSL
- Writable `storage` and `bootstrap/cache`
- Daily database and storage backups

## Render

MineTrack includes a `render.yaml` Blueprint and Docker setup for Render. The Blueprint creates:

- A Docker web service named `minetrack`
- A Render Postgres database named `minetrack-db`

Deploy from Render by creating a new Blueprint from the Git repository. After the service is created, update these environment variables in Render:

```text
APP_KEY=base64:... from `php artisan key:generate --show`
APP_URL=https://your-render-service-or-custom-domain
ASSET_URL=https://your-render-service-or-custom-domain
FACEBOOK_PAGE_ID=...
FACEBOOK_PAGE_ACCESS_TOKEN=...
```

The container runs `php artisan migrate --force` on startup. For the first production admin account and default settings, run this once from the Render shell:

```bash
php artisan db:seed --force
```

Then immediately change the seeded admin password.

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

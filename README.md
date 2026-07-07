# MineTrack

MineTrack is a manual-first internal web app for tracking Facebook "Mine" selling workflows.

## Stack

- Laravel API backend
- Laravel Sanctum authentication
- MySQL database
- React frontend with Vite
- Tailwind CSS and shadcn/ui-style components

## Local Setup

PHP and Composer are required for the backend.

This workspace currently has a portable PHP/Composer setup under `tools/` for local verification. If using that local setup on Windows, run Artisan/Composer like this:

```powershell
.\tools\php\php.exe .\tools\composer.phar install
.\tools\php\php.exe artisan migrate --seed
.\tools\php\php.exe artisan serve
```

If PHP and Composer are installed globally, use the usual commands:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm install
npm run dev
```

Default admin:

```text
Email: admin@minetrack.local
Password: password
```

## Current Build Scope

Implemented from the project spec:

- Laravel project scaffold
- React/Vite/Tailwind/shadcn/ui scaffold
- Sanctum-ready login/logout/user API routes
- Dashboard metrics and recent activity API routes
- Inventory item API routes with search, filters, status updates, mine history, and photo upload
- Customer API routes with search, detail, mined items, orders, and invoices
- Mine Tracker API routes with active/backup miner workflows and explicit move confirmation
- Order API routes with mined-item grouping and status updates
- Invoice API routes with order invoice generation, PDF output, image output, sent/cancel actions
- Payment API routes with full-payment-only validation and proof upload endpoint
- Packing and pickup/delivery API routes with order status actions
- Sales report API routes that count only paid invoices
- Settings, locations, payment methods, and categories management API routes
- Mobile navigation, PWA manifest, and service worker
- Deployment preparation notes in `docs/deployment.md`
- MySQL migrations for MineTrack core tables
- Eloquent models and relationships
- Seeders for admin, categories, payment methods, settings, and locations
- React dashboard, item list/form/detail, customer list/form/detail, Mine Tracker, order list/create/detail, invoice list/detail, payment history, packing, pickup/delivery, reports, and settings screens

Facebook API integration is intentionally not included in this MVP foundation.

## Progress Log

### 2026-07-07

Completed:

- Added Dashboard API and dashboard screen.
- Added Inventory API endpoints for item CRUD, filtering, status updates, photo upload, mine history, and status history.
- Added Inventory frontend screens for item list, add item, edit item, item detail, photo upload, status updates, mines, and status history.
- Added Customer API endpoints for CRUD, search, mined items, orders, and invoices.
- Added Customer frontend screens for list, add/edit form, and detail view.
- Added Mine Tracker API endpoints for first miners, backup miners, cancelling miners, and confirmed move-to-next-miner.
- Added Mine Tracker service enforcing manual-first rules and no automatic backup promotion.
- Added Mine Tracker page and item-detail miner controls.
- Added Orders API endpoints for creating orders from active mined items, listing orders, viewing order details, and updating order status.
- Added Order service for grouping mined items, computing totals, and marking completed order items as Sold.
- Added order list, create order, and order detail screens.
- Added Invoice service for generating invoices from orders, writing DomPDF PDF files, and writing shareable SVG image invoices.
- Added invoice list/detail screens with view PDF, view image, mark sent, cancel, and payment form actions.
- Added Payment service enforcing the exact error `Partial payment is not allowed.`
- Added payment history screen and payment proof upload endpoint.
- Added packing checklist screen and mark-packed endpoint.
- Added pickup/delivery screen and fulfillment status endpoints.
- Added sales report endpoints and reports dashboard.
- Added settings screen and management endpoints for shop settings, categories, locations, and payment methods.
- Fixed sidebar routing to use explicit paths.
- Added mobile navigation drawer.
- Added PWA manifest, app icon, and service worker registration.
- Added cancelled orders report endpoint/card.
- Added payment proof upload UI.
- Added create/delete UI for categories, locations, and payment methods in Settings.
- Added deployment preparation notes.
- Added frontend auth gate, 401 redirect handling, logout button, and logged-in user display.
- Tightened payment-method routes for explicit route model binding.
- Updated project progress checklist.

Verified:

- `npm run build` passes.
- Portable PHP 8.3.31 and Composer 2.10.2 were installed locally under `tools/`.
- `composer update` / package discovery passes after aligning dependencies to Laravel 12 + Sanctum 4.
- `php artisan migrate:fresh --seed` passes using SQLite for local verification.
- `php artisan route:list` passes and shows 76 routes.
- `php artisan storage:link` passes.
- Laravel dev server responds at `http://localhost:8000`.
- Sanctum login smoke test passes with the seeded admin account.
- End-to-end smoke test passes: create customer, item, mine, order, invoice, and payment.
- Partial payment validation returns `Partial payment is not allowed.`

Database / HeidiSQL:

- MineTrack is configured with Laravel's `mysql` database driver.
- Database: `minetrack`
- User: `minetrack`
- Password: `minetrack`
- Host: `127.0.0.1`
- Port: `3306`
- MariaDB 12.3 was used only as a local MySQL-compatible verification runtime in this workspace. For your final setup, use MySQL with the same database name and credentials, or update `.env` to match your MySQL user.

Additional verification:

- `.env` is configured with `DB_CONNECTION=mysql`.
- `php artisan migrate:fresh --seed` passes against a MySQL-compatible database.
- End-to-end database smoke test passes: create customer, item, mine, order, invoice, and payment.
- The database contains 21 application/framework tables after migration.
- Generated smoke records include order `ORD-20260707-0001` and invoice `INV-20260707-0001`.
- The invoice payment status is `Paid` after recording the full payment.

Blocked:

- In-app Browser QA is unavailable in this Codex session because no browser target is exposed. HTTP/API/build verification passed; do one manual browser click-through at `http://localhost:8000`.

Current next module:

- Manual browser click-through and any small UI polish found while using the app.

## Project Progress Todo

Status legend:

- `[x]` Done or scaffolded enough for this stage
- `[~]` Started, needs more implementation
- `[ ]` Not started

### Build Order Progress

- [x] 1. Project setup
  - Laravel app skeleton
  - React/Vite frontend skeleton
  - Tailwind CSS and shadcn/ui-style setup
  - MySQL-oriented `.env.example`

- [x] 2. Database migrations
  - Core MineTrack tables created: users, settings, locations, payment_methods, categories, items, customers, mines, orders, order_items, invoices, payments, status_logs
  - Framework tables created: sessions, cache, jobs, failed_jobs, Sanctum personal_access_tokens

- [x] 3. Models and relationships
  - Models created for all required domain tables
  - Main relationships, fillable fields, casts, and status helpers added

- [x] 4. Seeders
  - Admin user
  - Categories
  - Payment methods
  - Settings
  - Locations

- [~] 5. Authentication
  - Sanctum-ready login/logout/user API routes added
  - Login screen added
  - Frontend auth gate added
  - 401 redirect handling added
  - Logout button added
  - Logged-in user display added
  - Sanctum login smoke test passed on local SQLite setup
  - Still needs browser QA

- [~] 6. Dashboard API and layout
  - Metrics endpoint added
  - Recent activity endpoint added
  - Dashboard page and cards added
  - Still needs live backend verification and mobile polish

- [~] 7. Inventory module
  - Item CRUD API added
  - Search/filter API added
  - Photo upload endpoint added
  - Status update endpoint added
  - Item mines endpoint added
  - Items list frontend added
  - Item create/edit form added
  - Item detail page added
  - Status history UI added
  - Photo upload UI added
  - Add-miner and add-backup-miner actions added in item detail
  - Still needs create-order shortcut after the order flow is polished

- [~] 8. Customer module
  - Customer CRUD API added
  - Customer search added
  - Customer mined items endpoint added
  - Customer orders endpoint added
  - Customer invoices endpoint added
  - Customer list/form/detail frontend added
  - Still needs richer sales history after payments/reports exist

- [~] 9. Mine Tracker module
  - Record first miner API added
  - Add backup miners API added
  - Case-insensitive mine text validation added
  - Cancel miner API added
  - Move-to-next-miner service requires explicit admin confirmation
  - Confirmation UI added in Mine Tracker and item detail
  - Still needs richer empty states and live backend verification

- [~] 10. Orders module
  - Create order from selected active mined items added
  - Active mined items by customer endpoint added
  - Fees, discount, location, and total computation added
  - Order list/detail/create frontend added
  - Completed order marks related items as Sold
  - Invoice generation action added in order detail

- [~] 11. Invoice PDF and image generation
  - Generate invoice from order added
  - PDF invoice output added using DomPDF package wiring
  - Image invoice output added as a shareable SVG file
  - Invoice list/detail/actions frontend added
  - Still needs live backend verification and optional PNG renderer upgrade

- [~] 12. Payment module
  - Record payment API added
  - No partial payments rule enforced
  - Upload proof of payment endpoint added
  - Mark invoice/order paid flow added
  - Payment history frontend added
  - Proof upload UI added
  - Still needs live backend verification

- [~] 13. Packing / pickup / delivery module
  - Packing orders endpoint and checklist added
  - Mark packed, for pickup, for delivery, picked up, delivered, completed added
  - Completed order marks related items as Sold
  - Still needs live backend verification and richer location editing in workflow

- [~] 14. Sales reports
  - Today, weekly, monthly sales reports added
  - Paid/unpaid invoice reports added
  - Sold items report added
  - Cancelled orders report card added
  - Sales count only paid invoices
  - Still needs live backend verification

- [~] 15. Settings module
  - Shop details settings added
  - Default handling fee added
  - Reservation duration added
  - Payment methods management API added
  - Pickup/drop-off/delivery locations management API added
  - Invoice footer note added
  - Categories management API added
  - Create/delete UI for categories, locations, and payment methods added
  - Still needs inline edit UI and live backend verification

- [~] 16. Mobile/PWA polish
  - Mobile navigation added
  - Responsive table/card refinements
  - PWA manifest/service worker added
  - Still needs device/browser QA

- [~] 17. Deployment preparation
  - Production `.env` checklist added
  - Storage link/setup notes added
  - Build commands added
  - Database backup guidance added
  - Hosting/VPS deployment notes added
  - Still needs server-specific deployment validation

### Immediate Next Steps

1. Open HeidiSQL with your MySQL connection. For the prepared local credentials, use host `127.0.0.1`, user `minetrack`, password `minetrack`, database `minetrack`, port `3306`.
2. Open the app at `http://localhost:8000`.
3. Log in with `admin@minetrack.local` / `password`.
4. Do a manual browser click-through of the main screens and note any UI polish you want next.

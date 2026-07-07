# MineTrack App Usage Guide

This guide explains how to start MineTrack, access it through Tailscale, check the database in HeidiSQL, and use the main manual-first selling workflow.

## Start The App

From the project folder:

```powershell
.\tools\php\php.exe artisan config:clear
.\tools\php\php.exe artisan serve --host=127.0.0.1 --port=8000
```

Open:

```text
http://localhost:8000
```

Log in with:

```text
Email: admin@minetrack.local
Password: password
```

## Access Through Tailscale

For access from another Tailscale-connected device, run the server with:

```powershell
.\tools\php\php.exe artisan serve --host=0.0.0.0 --port=8000
```

Then open this PC's Tailscale URL:

```text
http://100.115.130.43:8000
```

If the Tailscale URL does not load from another device, allow inbound TCP port `8000` in Windows Firewall for this PC.

## Check The Database In HeidiSQL

Use your centralized MySQL connection:

```text
Host: 10.100.11.104
Port: 3306
User: root
Password: p@ssw0rd
Database: minetrack
```

After running migrations, refresh the `minetrack` database in HeidiSQL. You should see tables such as:

```text
users
items
customers
mines
orders
order_items
invoices
payments
settings
categories
locations
payment_methods
```

## Main Workflow

1. Add or review settings.
   - Go to Settings.
   - Check shop details, default handling fee, reservation duration, categories, locations, and payment methods.

2. Add inventory items.
   - Go to Inventory.
   - Click Add Item.
   - Enter item code, item name, category, price, and item details.
   - Upload a photo if available.
   - New items should normally start as `Available`.

3. Add customers.
   - Go to Customers.
   - Click Add Customer.
   - Enter the customer name, Facebook name, contact number, and address details.

4. Record a mine.
   - Go to Mine Tracker or open an item detail page.
   - Select the item and customer.
   - Enter the mine comment text manually.
   - The first valid miner becomes the active miner.
   - Backup miners can be added manually.

5. Move to backup miner only when needed.
   - If the first miner cancels or expires, use the move-to-next-miner action.
   - MineTrack requires explicit confirmation before promoting a backup miner.
   - The app does not automatically move backup miners.

6. Create an order.
   - Go to Orders.
   - Click Create Order.
   - Select a customer.
   - Select that customer's active mined items.
   - Add handling fee, delivery fee, discount, pickup/delivery method, and notes.
   - Save the order.

7. Generate an invoice.
   - Open the order detail page.
   - Click Generate Invoice.
   - Open the invoice detail page to view PDF/image invoice outputs.
   - Mark the invoice as sent when you send it to the customer.

8. Record payment.
   - Open the invoice detail page.
   - Select the payment method.
   - Enter the full invoice amount.
   - Add the reference number.
   - Upload proof of payment if available.
   - Partial payments are intentionally blocked.

9. Pack and release the order.
   - Go to Packing to mark paid orders as packed.
   - Go to Pickup / Delivery to mark orders for pickup, for delivery, picked up, delivered, or completed.
   - Completed orders mark the related items as sold.

10. Review reports.
    - Go to Reports.
    - Check today's sales, weekly sales, monthly sales, paid invoices, unpaid invoices, sold items, and cancelled orders.

## Useful Maintenance Commands

Run migrations and seeders on the configured database:

```powershell
.\tools\php\php.exe artisan migrate --seed
```

Reset the MineTrack database and seed fresh starter data:

```powershell
.\tools\php\php.exe artisan migrate:fresh --seed
```

Build frontend assets:

```powershell
npm run build
```

Check routes:

```powershell
.\tools\php\php.exe artisan route:list
```

## Important Notes

- Facebook API integration is not included yet. MineTrack is manual-first.
- Use `migrate:fresh --seed` only when it is okay to erase existing MineTrack data.
- Keep `.env` private. It is ignored by Git and should not be uploaded to GitHub.
- The default admin password should be changed before real production use.

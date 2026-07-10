# MineTrack App Usage Guide

This guide explains how to start MineTrack, access it through Tailscale, check the database in HeidiSQL, and use the main manual-first selling workflow.

## Start The App

From the project folder:

```powershell
.\tools\php\php.exe artisan config:clear
.\tools\php\php.exe artisan serve --host=127.0.0.1 --port=8000
```

For one-click startup after a reboot or power interruption, double-click:

```text
START_MineTrack_SERVER.cmd
```

The starter updates local/Tailscale browser settings automatically, checks database access, then starts the app. Keep the command window open while using MineTrack. Closing the window stops the server.

If the command window says the database login failed, your workstation IP changed. Open HeidiSQL as a working admin user and run the SQL shown in the command window, then start `START_MineTrack_SERVER.cmd` again.

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
http://YOUR-TAILSCALE-IP:8000
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

## Faster Workflow With Quick Import

Use Quick Import when you want to paste many mine comments instead of recording each miner one by one.

1. Go to Quick Import.

2. Paste one mine comment per line.

   Supported examples:

   ```text
   ITM-001 - Maria Santos - mine
   Juan Dela Cruz mine ITM-002
   ITM-003 Ana Reyes mine backup
   ```

3. If every pasted line belongs to the same item, choose that item in Default item.
   - If lines include item codes, leave Default item as Detect item code from each line.

4. Choose automation options.
   - Create missing customers: creates a basic customer record when the pasted name does not exist yet.
   - Create orders for active mines: groups newly active mined items by customer into orders.
   - Generate invoices too: creates invoices for the auto-created orders.

5. Click Preview import.
   - Ready lines can be processed.
   - Needs attention lines are missing an item, customer name, or mine keyword.
   - If an item already has an active miner, the imported line becomes a backup miner.

6. Click Process ready lines.

7. Review the import results.
   - Created orders and invoices are shown with links.
   - Open the order or invoice when you need to continue payment or fulfillment.

## Facebook Page Comment Automation

MineTrack can import mine comments from a Facebook Page post. This is for Facebook Pages, not personal profiles.

### Configure Facebook Page access

Add these values to `.env`:

```env
FACEBOOK_GRAPH_VERSION=v24.0
FACEBOOK_PAGE_ID=your_page_id
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token
```

Then clear config:

```powershell
.\tools\php\php.exe artisan config:clear
```

The Page access token must be able to read Page post engagement/comments. In Meta app setup, this normally means Page-related permissions such as Page engagement access, and the token must belong to the Page being synced.

### Sync an item from a Facebook Page post

1. Go to Items.
2. Add or edit an item.
3. Add the Facebook post link.
4. If URL parsing does not work, also add the Facebook post ID.
5. Open the item detail page.
6. Click Sync Page comments.

MineTrack will:

- Read comments from the configured Facebook Page post.
- Import only comments containing `mine`.
- Create a customer when the Facebook commenter does not exist yet.
- Add the first miner as active.
- Add later miners as backup miners.
- Skip comments that were already imported.

After syncing, continue with the normal order and invoice workflow.

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

- Facebook Page comment sync is available for Page posts when `FACEBOOK_PAGE_ID` and `FACEBOOK_PAGE_ACCESS_TOKEN` are configured. Personal profile automation is not supported.
- Use `migrate:fresh --seed` only when it is okay to erase existing MineTrack data.
- Keep `.env` private. It is ignored by Git and should not be uploaded to GitHub.
- The default admin password should be changed before real production use.

## Reset Test Data

For testing, Settings includes a tucked-away reset tool.

1. Go to Settings.
2. Scroll to the bottom.
3. Click Testing tools.
4. Type `RESET`.
5. Click Reset seeded database.

This runs the same reset as:

```powershell
.\tools\php\php.exe artisan migrate:fresh --seed
```

It removes added items, customers, mines, orders, invoices, payments, and other test records, then restores the original seeded admin, categories, payment methods, shop settings, and locations.

The reset button is only available when the Laravel app is running in `local` or `testing` mode.

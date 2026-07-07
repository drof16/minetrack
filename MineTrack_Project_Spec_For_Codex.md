# MineTrack Project Specification for Codex

## Purpose of This File

This file is the main project specification for **MineTrack**. Place this file inside the VS Code project folder so Codex can read it and use it as the reference when generating code, migrations, models, APIs, and frontend screens.

Codex instruction:

> Read this file first before generating or modifying code. Follow the requirements, workflows, data structures, and build order described here. If something is unclear, make the best practical assumption for an MVP Laravel + React internal web app.

---

# 1. Project Overview

## Project Name

**MineTrack**

## Project Type

Internal web application / PWA for online sellers using Facebook “Mine” selling.

## Business Context

The business sells thrift items, kitchenwares, melamines, and other products online, mainly through Facebook. Customers reserve items by commenting the word **Mine** on Facebook posts.

The business currently sells through mixed Facebook sources:

- Facebook Page
- Personal Facebook account
- Facebook Groups
- Facebook Marketplace
- Other Facebook posts

Because of this mixed setup, the MVP must be **manual-first** and should not depend on Facebook API automation yet.

## Main Goal

Build an app that tracks:

- Items
- Miners
- Backup miners
- Customer orders
- PDF invoices
- Image invoices
- Payments
- Packing status
- Pickup / delivery / drop-off status
- Sales reports
- Customizable business settings

---

# 2. Confirmed Requirements

## Selling Platform

The business sells on mixed Facebook sources, not only one Page.

MVP requirement:

- Allow admin to manually paste Facebook post links.
- Allow admin to manually paste Facebook comment links when available.
- Do not require Facebook API integration in MVP.

Future-ready requirement:

- Database and source fields should support future Facebook automation.

---

## Posting Style

The business uses:

- One item per post
- Multiple items in one post
- Photo albums

The business does **not** currently need live selling support.

---

## Mine Rule

A customer is considered a miner when the Facebook comment contains the word:

```text
mine
```

The match must be **case-insensitive**.

Valid examples:

```text
Mine
mine
MINE
mine po
mine sis
mine maam
mine madam
mine item 1
mine THR-001
```

MVP is manual entry, but validation/helper logic should treat text containing “mine” as a valid mine comment.

---

## Reservation Rule

No fixed reservation rule yet.

MVP requirement:

- Make reservation duration customizable in Settings.

Possible setting values:

- no_limit
- 24_hours
- 48_hours
- 3_days
- until_next_dropoff

Default:

```text
no_limit
```

---

## Payment Rule

Allow all payment methods except partial payment.

Allowed payment methods:

- GCash
- Maya
- Bank Transfer
- Cash on Pickup
- COD
- Other

Not allowed in MVP:

- Partial payment

Payment rule:

- Payment amount must equal invoice total amount.
- If payment amount is less than total, return validation error: **Partial payment is not allowed.**

---

## Pickup / Delivery / Drop-off Rules

These must be customizable.

The business may use different drop-off areas later and may change handling fees.

Settings must support:

- Default handling fee
- Pickup locations
- Drop-off locations
- Delivery areas
- Per-location fee
- Active/inactive locations

Seed sample locations:

- MhinTea Cafe, Babalag West as pickup
- Bulanao as delivery_area
- Nambaran as delivery_area
- Dagupan as delivery_area

---

## Order Grouping

The app must group multiple mined items from the same customer into one order and one invoice.

Example:

```text
Juan mined 5 items = 1 order = 1 invoice
```

---

## Backup Miner Rule

If the first miner cancels, the system must **ask admin first** before moving the item to the second miner.

No automatic transfer.

Required action:

- Show confirmation modal.
- If admin confirms, move next backup miner to active miner.
- If admin does not confirm, keep item unassigned or mark it available, depending on admin action.

---

## Invoice Output

The app must generate:

- PDF invoice
- Image invoice

The image invoice is important for Messenger sharing.

---

## Users

MVP:

- Only owner/admin will use the app.

Future-ready:

- Database should support future roles.

Future roles:

- Admin
- Encoder
- Sales Staff
- Packer
- Cashier
- Viewer

---

## Reports

MVP:

- Sales tracking only.

No profit tracking yet.

Sales should count only invoices where:

```text
payment_status = Paid
```

---

## Access

MVP:

- Internal use only.

No customer-facing portal yet.

---

# 3. Recommended Tech Stack

Use this stack:

| Layer | Technology |
|---|---|
| Frontend | React.js |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Laravel |
| API Auth | Laravel Sanctum |
| Database | MySQL or MariaDB |
| PDF Invoice | DomPDF or Browsershot |
| Image Invoice | HTML-to-image rendering |
| File Upload | Laravel Storage |
| Reports | Laravel queries + dashboard cards |
| Mobile Use | Responsive web app / PWA |

Preferred architecture:

```text
React Frontend
      ↓
Laravel REST API
      ↓
MySQL/MariaDB Database
      ↓
Laravel Storage for photos, proofs, PDFs, image invoices
```

Deployment:

- Development can run locally on developer PC.
- Production should be on web hosting or VPS with MySQL/MariaDB.
- No home computer/database server is required.

---

# 4. Main Workflow

```text
Add item
   ↓
Post item on Facebook
   ↓
Paste Facebook post link into app
   ↓
Customer comments Mine
   ↓
Admin records first miner in app
   ↓
Item status becomes Mined
   ↓
If other customers mine, add them as backup miners
   ↓
Group customer’s mined items into one order
   ↓
Generate PDF/image invoice
   ↓
Customer pays or selects pickup/COD/etc.
   ↓
Admin marks invoice/order as paid
   ↓
Pack item
   ↓
Pickup / delivery / drop-off
   ↓
Mark completed/sold
   ↓
Sales report updates
```

---

# 5. Status Definitions

## Item Statuses

Use these item statuses:

```text
Available
Mined
Confirmed
For Packing
Packed
For Pickup
For Delivery
Picked Up
Delivered
Sold
Cancelled
Unclaimed
Returned
Unavailable
```

Usual item flow:

```text
Available → Mined → Confirmed → For Packing → Packed → For Pickup/Delivery → Picked Up/Delivered → Sold
```

Exception statuses:

```text
Cancelled
Unclaimed
Returned
Unavailable
```

---

## Order Statuses

Use these order statuses:

```text
Draft
Confirmed
Invoiced
For Packing
Packed
For Pickup
For Delivery
Picked Up
Delivered
Completed
Cancelled
```

Usual order flow:

```text
Draft → Confirmed → Invoiced → For Packing → Packed → For Pickup/For Delivery → Picked Up/Delivered → Completed
```

---

## Invoice Statuses

Use these invoice statuses:

```text
Draft
Sent
Unpaid
Paid
Cancelled
Refunded
```

---

## Payment Statuses

Use these payment statuses:

```text
Unpaid
Paid
Refunded
Cancelled
```

No partial payment status in MVP.

---

## Mine Statuses

Use these mine statuses:

```text
active
backup
cancelled
moved
```

Rules:

- First miner gets `mine_rank = 1` and `status = active`.
- Backup miners get `status = backup`.
- If active miner cancels, do not automatically assign backup miner.
- Admin must manually confirm “Move to next miner.”

---

# 6. Modules and Features

## 6.1 Authentication

MVP:

- Admin login only.
- Use Laravel Sanctum for API auth.

Future-ready:

- Keep role field in users table.

---

## 6.2 Dashboard

Dashboard must show:

- Today’s sales
- Weekly sales
- Monthly sales
- Available items
- Mined items
- Unpaid invoices
- For packing count
- For pickup count
- For delivery count
- Sold items count
- Cancelled items/orders count

Sales count rule:

```text
Only count invoices where payment_status = Paid
```

---

## 6.3 Inventory Module

Admin can:

- Add item
- Edit item
- Upload photo
- Set category
- Set condition
- Set selling price
- Add Facebook post link
- Set item status
- Search item
- Filter by category
- Filter by status
- View item details
- View miner history

Item fields:

- item_code
- category_id
- item_name
- description
- condition
- selling_price
- facebook_post_url
- photo_path
- status

Do not include cost price yet because MVP is sales only.

---

## 6.4 Mine Tracker Module

Admin can:

- Record first miner
- Add backup miners
- Add mine/comment text
- Add Facebook comment URL
- Add mine time
- Set source
- Cancel miner
- Move to next miner after admin confirmation

Source values:

```text
manual
facebook_page
facebook_profile
facebook_group
facebook_marketplace
other
```

Validation/helper:

- Mine text containing “mine” should be considered valid.
- Matching is case-insensitive.

Move to next miner behavior:

1. Active miner is cancelled.
2. System shows next backup miner.
3. Admin clicks “Move to next miner.”
4. Show confirmation modal.
5. If confirmed:
   - Previous active remains cancelled.
   - Selected backup miner becomes active.
   - Item remains or becomes Mined.
   - Create status log.

---

## 6.5 Customers Module

Admin can:

- Add customer
- Edit customer
- Search customer
- View mined items
- View orders
- View invoices
- View unpaid invoices
- View sales history

Customer fields:

- name
- facebook_name
- facebook_profile_url
- contact_number
- address
- notes

---

## 6.6 Orders Module

Admin can create an order from mined items.

Required behavior:

1. Select customer.
2. Show all active mined items of the selected customer.
3. Admin selects items to include in the order.
4. System computes subtotal from item selling prices.
5. Admin adds handling fee, delivery fee, and discount if needed.
6. Admin selects pickup/delivery/drop-off method and location.
7. System computes total amount.
8. Admin creates order.
9. Admin can generate invoice from order.

Order fields:

- order_number
- customer_id
- subtotal
- handling_fee
- delivery_fee
- discount
- total_amount
- order_status
- payment_status
- pickup_or_delivery_method
- location_id
- notes

---

## 6.7 Invoice Module

Invoice must be generated from an order.

Required outputs:

- PDF invoice
- Image invoice

Invoice must include:

- Shop name from settings
- Invoice number
- Order number
- Date issued
- Customer name
- Item table
- Subtotal
- Handling fee
- Delivery/drop-off fee
- Discount
- Total amount
- Payment status
- Pickup/delivery/drop-off method
- Location
- Footer note from settings

Invoice fields:

- invoice_number
- order_id
- customer_id
- subtotal
- handling_fee
- delivery_fee
- discount
- total_amount
- amount_paid
- balance
- invoice_status
- payment_status
- pdf_path
- image_path
- issued_at
- paid_at

No partial payment.

---

## 6.8 Payment Module

Admin can:

- Record payment method
- Record amount
- Record reference number
- Upload proof of payment
- Mark invoice as paid

Payment rule:

- Partial payment is not allowed.
- Payment amount must equal invoice total amount.

If payment is valid:

- Create payment record.
- Update invoice `payment_status = Paid`.
- Update invoice `invoice_status = Paid`.
- Set invoice `amount_paid = total_amount`.
- Set invoice `balance = 0`.
- Set invoice `paid_at`.
- Update order `payment_status = Paid`.

If payment amount is less than invoice total:

- Return validation error: **Partial payment is not allowed.**

---

## 6.9 Packing / Pickup / Delivery Module

Admin can:

- View orders for packing
- View packing checklist
- Mark order as packed
- Set pickup/delivery/drop-off method
- Set location
- Mark order as for pickup
- Mark order as for delivery
- Mark order as picked up
- Mark order as delivered
- Mark order as completed

When order is completed:

- Mark order status as Completed.
- Mark related item statuses as Sold.

---

## 6.10 Settings Module

Settings must allow owner to customize:

- Shop name
- Default handling fee
- Reservation duration
- Payment methods
- Pickup locations
- Drop-off locations
- Delivery areas
- Invoice footer note
- Categories

Settings must include tables for:

- settings
- locations
- payment_methods
- categories

---

# 7. Database Blueprint

Create Laravel migrations for these tables.

Use appropriate foreign keys, indexes, timestamps, and soft deletes where useful.

---

## users

```text
id
name
email
password
role
status
created_at
updated_at
```

---

## settings

```text
id
setting_key
setting_value
created_at
updated_at
```

Example setting keys:

```text
shop_name
default_handling_fee
reservation_duration
invoice_footer_note
partial_payment_allowed
sales_count_basis
```

---

## locations

```text
id
location_name
location_type
fee
is_active
created_at
updated_at
```

Location types:

```text
pickup
dropoff
delivery_area
```

---

## payment_methods

```text
id
name
is_active
created_at
updated_at
```

---

## categories

```text
id
name
code
created_at
updated_at
```

Examples:

```text
Thrift = THR
Kitchenware = KIT
Melamine = MEL
Others = OTH
```

---

## items

```text
id
item_code
category_id
item_name
description
condition
selling_price
facebook_post_url
photo_path
status
created_at
updated_at
```

Indexes:

- item_code
- category_id
- status

---

## customers

```text
id
name
facebook_name
facebook_profile_url
contact_number
address
notes
created_at
updated_at
```

Indexes:

- name
- facebook_name
- contact_number

---

## mines

```text
id
item_id
customer_id
mine_rank
mine_text
facebook_comment_url
mine_time
source
status
notes
created_at
updated_at
```

Indexes:

- item_id
- customer_id
- mine_rank
- status

---

## orders

```text
id
order_number
customer_id
subtotal
handling_fee
delivery_fee
discount
total_amount
order_status
payment_status
pickup_or_delivery_method
location_id
notes
created_at
updated_at
```

Indexes:

- order_number
- customer_id
- order_status
- payment_status

---

## order_items

```text
id
order_id
item_id
item_code
item_name
quantity
unit_price
total_price
created_at
updated_at
```

---

## invoices

```text
id
invoice_number
order_id
customer_id
subtotal
handling_fee
delivery_fee
discount
total_amount
amount_paid
balance
invoice_status
payment_status
pdf_path
image_path
issued_at
paid_at
created_at
updated_at
```

Indexes:

- invoice_number
- order_id
- customer_id
- invoice_status
- payment_status

---

## payments

```text
id
invoice_id
order_id
customer_id
payment_method_id
amount
reference_number
proof_image_path
payment_date
notes
created_at
updated_at
```

---

## status_logs

```text
id
module
record_id
old_status
new_status
changed_by
notes
created_at
```

---

# 8. Eloquent Models and Relationships

Create these models:

- User
- Setting
- Location
- PaymentMethod
- Category
- Item
- Customer
- Mine
- Order
- OrderItem
- Invoice
- Payment
- StatusLog

Relationships:

- Category has many Items
- Item belongs to Category
- Item has many Mines
- Item has many OrderItems
- Customer has many Mines
- Customer has many Orders
- Customer has many Invoices
- Mine belongs to Item
- Mine belongs to Customer
- Order belongs to Customer
- Order belongs to Location
- Order has many OrderItems
- Order has one Invoice
- OrderItem belongs to Order
- OrderItem belongs to Item
- Invoice belongs to Order
- Invoice belongs to Customer
- Invoice has many Payments
- Payment belongs to Invoice
- Payment belongs to Order
- Payment belongs to Customer
- Payment belongs to PaymentMethod

Add:

- fillable fields
- casts for money/date fields
- helper methods for status updates where appropriate

---

# 9. API Endpoints

Use REST-style Laravel API routes.

## Auth

```text
POST /api/login
POST /api/logout
GET /api/user
```

---

## Dashboard

```text
GET /api/dashboard/metrics
GET /api/dashboard/recent-activity
```

---

## Items

```text
GET /api/items
POST /api/items
GET /api/items/{id}
PUT /api/items/{id}
DELETE /api/items/{id}
POST /api/items/{id}/upload-photo
PATCH /api/items/{id}/status
GET /api/items/{id}/mines
```

---

## Customers

```text
GET /api/customers
POST /api/customers
GET /api/customers/{id}
PUT /api/customers/{id}
DELETE /api/customers/{id}
GET /api/customers/{id}/mined-items
GET /api/customers/{id}/orders
GET /api/customers/{id}/invoices
```

---

## Mines

```text
GET /api/mines
POST /api/items/{item}/mines
POST /api/items/{item}/backup-mines
PATCH /api/mines/{mine}/cancel
POST /api/items/{item}/move-to-next-miner
```

Important:

- `move-to-next-miner` must require explicit admin action.
- Do not auto-move after cancellation.

---

## Orders

```text
GET /api/orders
POST /api/orders
GET /api/orders/{id}
PUT /api/orders/{id}
PATCH /api/orders/{id}/status
GET /api/customers/{customer}/active-mined-items
```

---

## Invoices

```text
GET /api/invoices
POST /api/orders/{order}/generate-invoice
GET /api/invoices/{id}
GET /api/invoices/{id}/pdf
GET /api/invoices/{id}/image
PATCH /api/invoices/{id}/mark-sent
PATCH /api/invoices/{id}/cancel
```

---

## Payments

```text
GET /api/payments
POST /api/invoices/{invoice}/payments
POST /api/payments/{payment}/upload-proof
```

---

## Packing / Pickup / Delivery

```text
GET /api/packing/orders
PATCH /api/orders/{order}/mark-packed
PATCH /api/orders/{order}/mark-for-pickup
PATCH /api/orders/{order}/mark-for-delivery
PATCH /api/orders/{order}/mark-picked-up
PATCH /api/orders/{order}/mark-delivered
PATCH /api/orders/{order}/mark-completed
```

---

## Reports

```text
GET /api/reports/sales/today
GET /api/reports/sales/weekly
GET /api/reports/sales/monthly
GET /api/reports/invoices/paid
GET /api/reports/invoices/unpaid
GET /api/reports/items/sold
```

---

## Settings

```text
GET /api/settings
PUT /api/settings
GET /api/locations
POST /api/locations
PUT /api/locations/{id}
DELETE /api/locations/{id}
GET /api/payment-methods
POST /api/payment-methods
PUT /api/payment-methods/{id}
DELETE /api/payment-methods/{id}
GET /api/categories
POST /api/categories
PUT /api/categories/{id}
DELETE /api/categories/{id}
```

---

# 10. Frontend Screens

Use React + Tailwind CSS + shadcn/ui.

## Layout

Create:

- AppLayout
- Sidebar
- Header
- Mobile navigation
- Auth layout

Main menu:

- Dashboard
- Items
- Mine Tracker
- Customers
- Orders
- Invoices
- Payments
- Packing
- Pickup / Delivery
- Reports
- Settings

---

## Login Screen

Fields:

- Email
- Password

---

## Dashboard Screen

Show cards:

- Today’s sales
- This week’s sales
- This month’s sales
- Available items
- Mined items
- Unpaid invoices
- For packing
- For pickup
- For delivery
- Sold items

---

## Items Screens

Components:

- ItemsList
- ItemForm
- ItemDetail
- ItemStatusBadge
- ItemPhotoUpload
- ItemFilters

Item list columns:

- Photo thumbnail
- Item code
- Item name
- Category
- Selling price
- Status
- Facebook post link
- Actions

Item detail should show:

- Full item details
- Photo
- Status history
- Mines list
- Add miner button
- Add backup miner button
- Change status button
- Create order button

---

## Mine Tracker Screens

Components:

- MineTrackerPage
- AddMinerModal
- BackupMinersList
- MoveToNextMinerConfirmation

Required UI:

- Show item
- Show active miner
- Show backup miners
- Show cancelled miners
- Button to cancel active miner
- Button to move to next miner
- Confirmation modal before moving

---

## Customers Screens

Components:

- CustomersList
- CustomerForm
- CustomerDetail

Customer detail shows:

- Customer info
- Mined items
- Orders
- Invoices
- Unpaid invoices

---

## Orders Screens

Components:

- OrdersList
- CreateOrderPage
- OrderDetail
- SelectMinedItemsForCustomer
- FeesAndTotalsForm

Create order flow:

1. Select customer.
2. Fetch active mined items.
3. Select items.
4. Set fees and discount.
5. Select pickup/delivery method and location.
6. Create order.
7. Generate invoice.

---

## Invoice Screens

Components:

- InvoicesList
- InvoiceDetail
- InvoicePreview
- InvoiceActions

Actions:

- Generate PDF
- Generate image
- View PDF
- View image
- Mark sent
- Mark paid through payment form
- Cancel invoice

---

## Payment Screens

Components:

- PaymentForm
- PaymentHistory
- ProofUpload

Validation:

- Payment amount must equal invoice total amount.
- Show error if lower than total: Partial payment is not allowed.

---

## Packing Screen

Components:

- PackingPage
- PackingChecklist

Features:

- View orders for packing
- Checklist of order items
- Mark packed

---

## Pickup / Delivery Screen

Components:

- PickupDeliveryPage
- OrderStatusActions

Features:

- View for pickup
- View for delivery
- Set location
- Mark picked up
- Mark delivered
- Mark completed

---

## Reports Screen

Reports:

- Today’s sales
- Weekly sales
- Monthly sales
- Paid invoices
- Unpaid invoices
- Sold items
- Cancelled orders

---

## Settings Screen

Sections:

- Shop details
- Default handling fee
- Reservation duration
- Payment methods
- Pickup/drop-off/delivery locations
- Invoice footer note
- Categories

---

# 11. Seeder Requirements

Create seeders for:

## Admin User

Default admin:

```text
Name: Admin
Email: admin@minetrack.local
Password: password
Role: admin
Status: active
```

## Categories

- Thrift / THR
- Kitchenware / KIT
- Melamine / MEL
- Others / OTH

## Payment Methods

- GCash
- Maya
- Bank Transfer
- Cash on Pickup
- COD
- Other

## Settings

```text
shop_name = MineTrack Shop
default_handling_fee = 10
reservation_duration = no_limit
invoice_footer_note = Thank you for mining!
partial_payment_allowed = false
sales_count_basis = paid_invoice
```

## Locations

- MhinTea Cafe, Babalag West / pickup / fee 0
- Bulanao / delivery_area / fee 0
- Nambaran / delivery_area / fee 0
- Dagupan / delivery_area / fee 0

---

# 12. Business Rules

## Sales Count Rule

Only count sales when:

```text
invoice.payment_status = Paid
```

---

## Partial Payment Rule

MVP does not allow partial payment.

Payment is valid only if:

```text
payment.amount == invoice.total_amount
```

---

## Mine Rank Rule

For each item:

- Rank 1 is active miner.
- Rank 2 and above are backup miners.
- Only one active miner per item.

---

## Moving Miner Rule

If active miner cancels:

- Do not automatically assign backup.
- Admin must confirm move to next miner.

---

## Order Grouping Rule

One customer can have many mined items.

Admin can select multiple active mined items and create one order.

---

## Completed Order Rule

When order is completed:

- Order status becomes Completed.
- Items in order become Sold.

---

# 13. Build Order for Codex

Follow this order:

1. Project setup
2. Database migrations
3. Models and relationships
4. Seeders
5. Authentication
6. Dashboard API and layout
7. Inventory module
8. Customer module
9. Mine Tracker module
10. Orders module
11. Invoice PDF and image generation
12. Payment module
13. Packing / pickup / delivery module
14. Sales reports
15. Settings module
16. Mobile/PWA polish
17. Deployment preparation

---

# 14. Codex Working Instructions

When generating code:

- Keep code clean and maintainable.
- Use Laravel conventions.
- Use React components with clear names.
- Use Tailwind CSS and shadcn/ui where possible.
- Validate all backend requests using Form Requests where appropriate.
- Use services for complex business logic such as invoice generation, payment validation, and miner movement.
- Use policies/middleware where needed.
- Log important status changes in `status_logs`.
- Keep MVP manual-first.
- Do not implement Facebook API integration yet unless explicitly requested later.

Suggested service classes:

- ItemStatusService
- MineService
- OrderService
- InvoiceService
- PaymentService
- ReportService
- SettingsService

---

# 15. First Codex Prompt to Use After Adding This File

Paste this into Codex after placing this file in the project folder:

```text
Read the file MineTrack_Project_Spec_For_Codex.md in this project folder. Use it as the main project specification.

Start by creating the Laravel + React project structure for MineTrack using Laravel as the backend API, React as the frontend, MySQL as the database, Laravel Sanctum for authentication, Tailwind CSS and shadcn/ui for the UI.

Follow the build order in the specification. First implement the project setup, authentication scaffold, database migrations, Eloquent models, and seeders. Do not implement Facebook API integration yet. Keep the app manual-first.
```

---

# 16. Server / Database Note

The business does not need a computer at home as a database server.

Recommended setup:

```text
Developer PC for coding and local testing
Cloud hosting or VPS for production app and database
Owner uses phone/browser to access the app
```

Production should use:

- Web hosting or VPS
- MySQL/MariaDB database
- SSL certificate
- Daily backups

Avoid using a home computer as the production database server because it must stay powered on and connected to stable internet.

---

# 17. MVP Success Criteria

MVP is successful when the owner can:

1. Add items.
2. Record who mined first.
3. Add backup miners.
4. Group mined items into one customer order.
5. Generate PDF invoice.
6. Generate image invoice.
7. Mark invoice as paid/unpaid.
8. Track order status.
9. Mark items as packed, picked up/delivered, and sold.
10. View daily, weekly, and monthly sales.
11. Change handling fee, locations, payment methods, and invoice notes in settings.


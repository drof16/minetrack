<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <style>
            body { color: #111827; font-family: DejaVu Sans, sans-serif; font-size: 12px; }
            h1 { font-size: 24px; margin: 0; }
            h2 { font-size: 16px; margin: 0 0 8px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background: #f3f4f6; font-size: 11px; text-transform: uppercase; }
            .header { display: table; width: 100%; margin-bottom: 24px; }
            .header > div { display: table-cell; vertical-align: top; }
            .right { text-align: right; }
            .muted { color: #6b7280; }
            .totals { margin-left: auto; margin-top: 18px; width: 260px; }
            .totals td { border: 0; padding: 4px 0; }
            .total { font-size: 16px; font-weight: bold; }
            .footer { border-top: 1px solid #e5e7eb; margin-top: 28px; padding-top: 12px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div>
                <h1>{{ $shopName }}</h1>
                <div class="muted">Invoice {{ $invoice->invoice_number }}</div>
            </div>
            <div class="right">
                <div><strong>Order:</strong> {{ $invoice->order->order_number }}</div>
                <div><strong>Date:</strong> {{ optional($invoice->issued_at)->format('Y-m-d') }}</div>
                <div><strong>Payment:</strong> {{ $invoice->payment_status }}</div>
            </div>
        </div>

        <h2>Customer</h2>
        <p>{{ $invoice->customer->name }}</p>

        <table>
            <thead>
                <tr>
                    <th>Item Code</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($invoice->order->orderItems as $item)
                    <tr>
                        <td>{{ $item->item_code }}</td>
                        <td>{{ $item->item_name }}</td>
                        <td>{{ $item->quantity }}</td>
                        <td>PHP {{ number_format((float) $item->unit_price, 2) }}</td>
                        <td>PHP {{ number_format((float) $item->total_price, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <table class="totals">
            <tr><td>Subtotal</td><td class="right">PHP {{ number_format((float) $invoice->subtotal, 2) }}</td></tr>
            <tr><td>Handling fee</td><td class="right">PHP {{ number_format((float) $invoice->handling_fee, 2) }}</td></tr>
            <tr><td>Delivery/drop-off fee</td><td class="right">PHP {{ number_format((float) $invoice->delivery_fee, 2) }}</td></tr>
            <tr><td>Discount</td><td class="right">PHP {{ number_format((float) $invoice->discount, 2) }}</td></tr>
            <tr class="total"><td>Total</td><td class="right">PHP {{ number_format((float) $invoice->total_amount, 2) }}</td></tr>
        </table>

        <p><strong>Method:</strong> {{ $invoice->order->pickup_or_delivery_method ?: '-' }}</p>
        <p><strong>Location:</strong> {{ $invoice->order->location?->location_name ?: '-' }}</p>

        <div class="footer">{{ $footerNote }}</div>
    </body>
</html>

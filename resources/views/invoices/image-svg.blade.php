<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
    <rect width="900" height="1200" fill="#ffffff"/>
    <rect x="48" y="48" width="804" height="1104" rx="18" fill="#ffffff" stroke="#d1d5db"/>
    <text x="80" y="110" fill="#111827" font-family="Arial, sans-serif" font-size="34" font-weight="700">{{ $shopName }}</text>
    <text x="80" y="150" fill="#6b7280" font-family="Arial, sans-serif" font-size="18">Invoice {{ $invoice->invoice_number }}</text>
    <text x="620" y="110" fill="#111827" font-family="Arial, sans-serif" font-size="18">Order: {{ $invoice->order->order_number }}</text>
    <text x="620" y="140" fill="#111827" font-family="Arial, sans-serif" font-size="18">Date: {{ optional($invoice->issued_at)->format('Y-m-d') }}</text>
    <text x="620" y="170" fill="#111827" font-family="Arial, sans-serif" font-size="18">Payment: {{ $invoice->payment_status }}</text>
    <line x1="80" y1="205" x2="820" y2="205" stroke="#e5e7eb"/>
    <text x="80" y="255" fill="#111827" font-family="Arial, sans-serif" font-size="22" font-weight="700">Customer</text>
    <text x="80" y="290" fill="#374151" font-family="Arial, sans-serif" font-size="20">{{ $invoice->customer->name }}</text>

    <rect x="80" y="330" width="740" height="44" fill="#f3f4f6"/>
    <text x="100" y="358" fill="#374151" font-family="Arial, sans-serif" font-size="15" font-weight="700">ITEM</text>
    <text x="650" y="358" fill="#374151" font-family="Arial, sans-serif" font-size="15" font-weight="700">TOTAL</text>

    @php $y = 410; @endphp
    @foreach ($invoice->order->orderItems->take(12) as $item)
        <text x="100" y="{{ $y }}" fill="#111827" font-family="Arial, sans-serif" font-size="18">{{ $item->item_code }} - {{ \Illuminate\Support\Str::limit($item->item_name, 42) }}</text>
        <text x="650" y="{{ $y }}" fill="#111827" font-family="Arial, sans-serif" font-size="18">PHP {{ number_format((float) $item->total_price, 2) }}</text>
        <line x1="80" y1="{{ $y + 22 }}" x2="820" y2="{{ $y + 22 }}" stroke="#f3f4f6"/>
        @php $y += 48; @endphp
    @endforeach

    <text x="560" y="900" fill="#374151" font-family="Arial, sans-serif" font-size="18">Subtotal</text>
    <text x="700" y="900" fill="#111827" font-family="Arial, sans-serif" font-size="18">PHP {{ number_format((float) $invoice->subtotal, 2) }}</text>
    <text x="560" y="935" fill="#374151" font-family="Arial, sans-serif" font-size="18">Fees</text>
    <text x="700" y="935" fill="#111827" font-family="Arial, sans-serif" font-size="18">PHP {{ number_format((float) $invoice->handling_fee + (float) $invoice->delivery_fee, 2) }}</text>
    <text x="560" y="970" fill="#374151" font-family="Arial, sans-serif" font-size="18">Discount</text>
    <text x="700" y="970" fill="#111827" font-family="Arial, sans-serif" font-size="18">PHP {{ number_format((float) $invoice->discount, 2) }}</text>
    <text x="560" y="1020" fill="#111827" font-family="Arial, sans-serif" font-size="24" font-weight="700">Total</text>
    <text x="700" y="1020" fill="#111827" font-family="Arial, sans-serif" font-size="24" font-weight="700">PHP {{ number_format((float) $invoice->total_amount, 2) }}</text>
    <text x="80" y="1100" fill="#6b7280" font-family="Arial, sans-serif" font-size="18">{{ $footerNote }}</text>
</svg>

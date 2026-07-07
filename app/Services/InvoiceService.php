<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\Setting;
use App\Models\StatusLog;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class InvoiceService
{
    public function generateFromOrder(Order $order, ?User $user = null): Invoice
    {
        if ($order->invoice()->exists()) {
            throw ValidationException::withMessages([
                'order_id' => ['This order already has an invoice.'],
            ]);
        }

        $invoice = Invoice::create([
            'invoice_number' => $this->nextInvoiceNumber(),
            'order_id' => $order->id,
            'customer_id' => $order->customer_id,
            'subtotal' => $order->subtotal,
            'handling_fee' => $order->handling_fee,
            'delivery_fee' => $order->delivery_fee,
            'discount' => $order->discount,
            'total_amount' => $order->total_amount,
            'amount_paid' => 0,
            'balance' => $order->total_amount,
            'invoice_status' => Invoice::STATUS_DRAFT,
            'payment_status' => Invoice::PAYMENT_STATUS_UNPAID,
            'issued_at' => now(),
        ]);

        $invoice->forceFill([
            'pdf_path' => $this->writePdf($invoice),
            'image_path' => $this->writeImageSvg($invoice),
        ])->save();

        $order->updateStatus('Invoiced', $user, "Invoice {$invoice->invoice_number} generated.");
        StatusLog::record('invoices', $invoice->id, null, Invoice::STATUS_DRAFT, $user?->id, 'Invoice generated from order.');

        return $invoice->load(['order.orderItems', 'order.location', 'customer']);
    }

    public function markSent(Invoice $invoice, ?User $user = null): Invoice
    {
        $oldStatus = $invoice->invoice_status;
        $invoice->forceFill(['invoice_status' => Invoice::STATUS_SENT])->save();
        StatusLog::record('invoices', $invoice->id, $oldStatus, Invoice::STATUS_SENT, $user?->id, 'Invoice marked sent.');

        return $invoice->load(['order.orderItems', 'order.location', 'customer']);
    }

    public function cancel(Invoice $invoice, ?User $user = null): Invoice
    {
        $oldStatus = $invoice->invoice_status;
        $invoice->forceFill([
            'invoice_status' => Invoice::STATUS_CANCELLED,
            'payment_status' => Invoice::PAYMENT_STATUS_CANCELLED,
        ])->save();
        $invoice->order?->forceFill(['payment_status' => Order::PAYMENT_STATUS_UNPAID])->save();
        StatusLog::record('invoices', $invoice->id, $oldStatus, Invoice::STATUS_CANCELLED, $user?->id, 'Invoice cancelled.');

        return $invoice->load(['order.orderItems', 'order.location', 'customer']);
    }

    public function invoiceData(Invoice $invoice): array
    {
        $invoice->loadMissing(['order.orderItems', 'order.location', 'customer']);

        return [
            'invoice' => $invoice,
            'shopName' => Setting::query()->where('setting_key', 'shop_name')->value('setting_value') ?: 'MineTrack Shop',
            'footerNote' => Setting::query()->where('setting_key', 'invoice_footer_note')->value('setting_value') ?: 'Thank you for mining!',
        ];
    }

    private function writePdf(Invoice $invoice): string
    {
        $path = "invoices/pdf/{$invoice->invoice_number}.pdf";
        $pdf = Pdf::loadView('invoices.pdf', $this->invoiceData($invoice))->setPaper('a4');
        Storage::disk('public')->put($path, $pdf->output());

        return $path;
    }

    private function writeImageSvg(Invoice $invoice): string
    {
        $path = "invoices/images/{$invoice->invoice_number}.svg";
        $svg = view('invoices.image-svg', $this->invoiceData($invoice))->render();
        Storage::disk('public')->put($path, $svg);

        return $path;
    }

    private function nextInvoiceNumber(): string
    {
        $prefix = 'INV-'.now()->format('Ymd');
        $count = Invoice::query()->where('invoice_number', 'like', "{$prefix}-%")->count() + 1;

        return sprintf('%s-%04d', $prefix, $count);
    }
}

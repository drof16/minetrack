<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use App\Models\Order;
use App\Services\InvoiceService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class InvoiceController extends Controller
{
    public function __construct(private readonly InvoiceService $invoiceService)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $invoices = Invoice::query()
            ->with(['customer', 'order'])
            ->when($request->filled('payment_status'), fn ($query) => $query->where('payment_status', $request->string('payment_status')->toString()))
            ->when($request->filled('invoice_status'), fn ($query) => $query->where('invoice_status', $request->string('invoice_status')->toString()))
            ->latest()
            ->paginate($request->integer('per_page', 25));

        return InvoiceResource::collection($invoices);
    }

    public function generate(Order $order, Request $request): InvoiceResource
    {
        return InvoiceResource::make($this->invoiceService->generateFromOrder($order, $request->user()));
    }

    public function show(Invoice $invoice): InvoiceResource
    {
        return InvoiceResource::make($invoice->load(['order.orderItems', 'order.location', 'customer', 'payments.paymentMethod']));
    }

    public function pdf(Invoice $invoice)
    {
        abort_unless($invoice->pdf_path && Storage::disk('public')->exists($invoice->pdf_path), 404);

        return response(Storage::disk('public')->get($invoice->pdf_path), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$invoice->invoice_number.'.pdf"',
        ]);
    }

    public function image(Invoice $invoice)
    {
        abort_unless($invoice->image_path && Storage::disk('public')->exists($invoice->image_path), 404);

        return response(Storage::disk('public')->get($invoice->image_path), 200, [
            'Content-Type' => 'image/svg+xml',
            'Content-Disposition' => 'inline; filename="'.$invoice->invoice_number.'.svg"',
        ]);
    }

    public function markSent(Invoice $invoice, Request $request): InvoiceResource
    {
        return InvoiceResource::make($this->invoiceService->markSent($invoice, $request->user()));
    }

    public function cancel(Invoice $invoice, Request $request): InvoiceResource
    {
        return InvoiceResource::make($this->invoiceService->cancel($invoice, $request->user()));
    }
}

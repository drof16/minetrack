<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payments\StorePaymentRequest;
use App\Http\Requests\Payments\UploadPaymentProofRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $payments = Payment::query()
            ->with('paymentMethod')
            ->when($request->filled('invoice_id'), fn ($query) => $query->where('invoice_id', $request->integer('invoice_id')))
            ->latest()
            ->paginate($request->integer('per_page', 25));

        return PaymentResource::collection($payments);
    }

    public function store(StorePaymentRequest $request, Invoice $invoice): PaymentResource
    {
        return PaymentResource::make(
            $this->paymentService->recordPayment($invoice, $request->validated(), $request->user())
        );
    }

    public function uploadProof(UploadPaymentProofRequest $request, Payment $payment): PaymentResource
    {
        if ($payment->proof_image_path) {
            Storage::disk('public')->delete($payment->proof_image_path);
        }

        $path = $request->file('proof')->store('payments/proofs', 'public');
        $payment->update(['proof_image_path' => $path]);

        return PaymentResource::make($payment->load('paymentMethod'));
    }
}

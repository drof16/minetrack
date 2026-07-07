<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\Payment;
use App\Models\StatusLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function recordPayment(Invoice $invoice, array $data, ?User $user = null): Payment
    {
        return DB::transaction(function () use ($invoice, $data, $user): Payment {
            $paymentCents = (int) round(((float) $data['amount']) * 100);
            $invoiceCents = (int) round(((float) $invoice->total_amount) * 100);

            if ($paymentCents !== $invoiceCents) {
                throw ValidationException::withMessages([
                    'amount' => ['Partial payment is not allowed.'],
                ]);
            }

            if ($invoice->payment_status === Invoice::PAYMENT_STATUS_PAID) {
                throw ValidationException::withMessages([
                    'invoice_id' => ['This invoice is already paid.'],
                ]);
            }

            $payment = Payment::create([
                'invoice_id' => $invoice->id,
                'order_id' => $invoice->order_id,
                'customer_id' => $invoice->customer_id,
                'payment_method_id' => $data['payment_method_id'],
                'amount' => $data['amount'],
                'reference_number' => $data['reference_number'] ?? null,
                'payment_date' => $data['payment_date'] ?? now(),
                'notes' => $data['notes'] ?? null,
            ]);

            $invoice->markPaid($user);
            $invoice->order?->forceFill(['payment_status' => Order::PAYMENT_STATUS_PAID])->save();
            StatusLog::record('payments', $payment->id, null, 'Paid', $user?->id, 'Payment recorded.');

            return $payment->load(['paymentMethod']);
        });
    }
}

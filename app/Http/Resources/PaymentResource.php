<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_id' => $this->invoice_id,
            'order_id' => $this->order_id,
            'customer_id' => $this->customer_id,
            'payment_method_id' => $this->payment_method_id,
            'payment_method' => PaymentMethodResource::make($this->whenLoaded('paymentMethod')),
            'amount' => $this->amount,
            'reference_number' => $this->reference_number,
            'proof_image_path' => $this->proof_image_path,
            'proof_image_url' => $this->proof_image_path ? Storage::disk('public')->url($this->proof_image_path) : null,
            'payment_date' => $this->payment_date?->toISOString(),
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}

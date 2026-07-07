<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'order_id' => $this->order_id,
            'customer_id' => $this->customer_id,
            'customer' => $this->whenLoaded('customer', fn () => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'facebook_name' => $this->customer->facebook_name,
            ]),
            'order' => $this->whenLoaded('order', fn () => [
                'id' => $this->order->id,
                'order_number' => $this->order->order_number,
                'order_status' => $this->order->order_status,
                'payment_status' => $this->order->payment_status,
                'order_items' => $this->order->relationLoaded('orderItems') ? OrderItemResource::collection($this->order->orderItems) : [],
                'location' => $this->order->relationLoaded('location') && $this->order->location ? [
                    'id' => $this->order->location->id,
                    'location_name' => $this->order->location->location_name,
                    'location_type' => $this->order->location->location_type,
                ] : null,
            ]),
            'subtotal' => $this->subtotal,
            'handling_fee' => $this->handling_fee,
            'delivery_fee' => $this->delivery_fee,
            'discount' => $this->discount,
            'total_amount' => $this->total_amount,
            'amount_paid' => $this->amount_paid,
            'balance' => $this->balance,
            'invoice_status' => $this->invoice_status,
            'payment_status' => $this->payment_status,
            'pdf_path' => $this->pdf_path,
            'image_path' => $this->image_path,
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'issued_at' => $this->issued_at?->toISOString(),
            'paid_at' => $this->paid_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}

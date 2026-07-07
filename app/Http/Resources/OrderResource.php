<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'customer_id' => $this->customer_id,
            'subtotal' => $this->subtotal,
            'handling_fee' => $this->handling_fee,
            'delivery_fee' => $this->delivery_fee,
            'discount' => $this->discount,
            'total_amount' => $this->total_amount,
            'order_status' => $this->order_status,
            'payment_status' => $this->payment_status,
            'pickup_or_delivery_method' => $this->pickup_or_delivery_method,
            'location' => $this->whenLoaded('location', fn () => [
                'id' => $this->location?->id,
                'location_name' => $this->location?->location_name,
                'location_type' => $this->location?->location_type,
            ]),
            'customer' => $this->whenLoaded('customer', fn () => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'facebook_name' => $this->customer->facebook_name,
            ]),
            'order_items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}

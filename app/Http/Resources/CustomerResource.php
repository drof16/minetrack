<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'facebook_name' => $this->facebook_name,
            'facebook_profile_url' => $this->facebook_profile_url,
            'contact_number' => $this->contact_number,
            'address' => $this->address,
            'notes' => $this->notes,
            'mines_count' => $this->whenCounted('mines'),
            'orders_count' => $this->whenCounted('orders'),
            'invoices_count' => $this->whenCounted('invoices'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

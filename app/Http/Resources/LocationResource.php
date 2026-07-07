<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'location_name' => $this->location_name,
            'location_type' => $this->location_type,
            'fee' => $this->fee,
            'is_active' => $this->is_active,
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StatusLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'module' => $this->module,
            'record_id' => $this->record_id,
            'old_status' => $this->old_status,
            'new_status' => $this->new_status,
            'changed_by' => $this->whenLoaded('changedBy', fn () => [
                'id' => $this->changedBy?->id,
                'name' => $this->changedBy?->name,
            ]),
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}

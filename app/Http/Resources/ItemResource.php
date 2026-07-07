<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item_code' => $this->item_code,
            'category_id' => $this->category_id,
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'item_name' => $this->item_name,
            'description' => $this->description,
            'condition' => $this->condition,
            'selling_price' => $this->selling_price,
            'facebook_post_url' => $this->facebook_post_url,
            'photo_path' => $this->photo_path,
            'photo_url' => $this->photo_path ? Storage::disk('public')->url($this->photo_path) : null,
            'status' => $this->status,
            'mines' => MineResource::collection($this->whenLoaded('mines')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'item_id' => $this->item_id,
            'item' => $this->whenLoaded('item', fn () => [
                'id' => $this->item->id,
                'item_code' => $this->item->item_code,
                'item_name' => $this->item->item_name,
                'status' => $this->item->status,
                'category' => $this->item->relationLoaded('category') && $this->item->category ? [
                    'id' => $this->item->category->id,
                    'name' => $this->item->category->name,
                    'code' => $this->item->category->code,
                ] : null,
            ]),
            'customer_id' => $this->customer_id,
            'customer' => $this->whenLoaded('customer', fn () => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'facebook_name' => $this->customer->facebook_name,
            ]),
            'mine_rank' => $this->mine_rank,
            'mine_text' => $this->mine_text,
            'facebook_comment_url' => $this->facebook_comment_url,
            'mine_time' => $this->mine_time?->toISOString(),
            'source' => $this->source,
            'status' => $this->status,
            'notes' => $this->notes,
            'is_valid_mine_text' => $this->containsMineKeyword(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}

<?php

namespace App\Http\Requests\Items;

use App\Models\Item;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $item = $this->route('item');

        return [
            'item_code' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('items', 'item_code')->ignore($item)],
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'item_name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'condition' => ['nullable', 'string', 'max:255'],
            'selling_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'facebook_post_url' => ['nullable', 'url', 'max:2048'],
            'photo_path' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'required', Rule::in(Item::STATUSES)],
        ];
    }
}

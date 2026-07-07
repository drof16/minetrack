<?php

namespace App\Http\Requests\Items;

use App\Models\Item;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'item_code' => ['required', 'string', 'max:255', 'unique:items,item_code'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'item_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'condition' => ['nullable', 'string', 'max:255'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'facebook_post_url' => ['nullable', 'url', 'max:2048'],
            'photo_path' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'required', Rule::in(Item::STATUSES)],
        ];
    }
}

<?php

namespace App\Http\Requests\Mines;

use App\Models\Mine;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'mine_text' => ['required', 'string'],
            'facebook_comment_url' => ['nullable', 'url', 'max:2048'],
            'mine_time' => ['nullable', 'date'],
            'source' => ['nullable', Rule::in(Mine::SOURCES)],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function after(): array
    {
        return [
            function ($validator): void {
                if (! Mine::textContainsMineKeyword($this->input('mine_text'))) {
                    $validator->errors()->add('mine_text', 'Mine text must contain the word mine.');
                }
            },
        ];
    }
}

<?php

namespace App\Http\Requests\Mines;

use Illuminate\Foundation\Http\FormRequest;

class CancelMineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'notes' => ['nullable', 'string'],
        ];
    }
}

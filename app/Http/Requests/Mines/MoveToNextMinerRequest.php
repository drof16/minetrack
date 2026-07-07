<?php

namespace App\Http\Requests\Mines;

use Illuminate\Foundation\Http\FormRequest;

class MoveToNextMinerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'confirm' => ['accepted'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'confirm.accepted' => 'Admin confirmation is required before moving to the next miner.',
        ];
    }
}

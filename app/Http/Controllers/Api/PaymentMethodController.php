<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentMethodResource;
use App\Models\PaymentMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaymentMethodController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return PaymentMethodResource::collection(
            PaymentMethod::query()->where('is_active', true)->orderBy('name')->get()
        );
    }

    public function store(Request $request): PaymentMethodResource
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:payment_methods,name'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        return PaymentMethodResource::make(PaymentMethod::create($data + ['is_active' => true]));
    }

    public function update(Request $request, PaymentMethod $paymentMethod): PaymentMethodResource
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:payment_methods,name,'.$paymentMethod->id],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $paymentMethod->update($data);

        return PaymentMethodResource::make($paymentMethod);
    }

    public function destroy(PaymentMethod $paymentMethod): JsonResponse
    {
        $paymentMethod->delete();

        return response()->json(['message' => 'Payment method deleted.']);
    }
}

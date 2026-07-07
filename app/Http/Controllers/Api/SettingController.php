<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Setting::query()->pluck('setting_value', 'setting_key'),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'shop_name' => ['nullable', 'string', 'max:255'],
            'default_handling_fee' => ['nullable', 'numeric', 'min:0'],
            'reservation_duration' => ['nullable', 'in:no_limit,24_hours,48_hours,3_days,until_next_dropoff'],
            'invoice_footer_note' => ['nullable', 'string'],
            'partial_payment_allowed' => ['nullable', 'in:false,0'],
            'sales_count_basis' => ['nullable', 'in:paid_invoice'],
        ]);

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(['setting_key' => $key], ['setting_value' => (string) $value]);
        }

        return $this->index();
    }
}

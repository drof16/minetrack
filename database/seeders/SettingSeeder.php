<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'shop_name' => 'MineTrack Shop',
            'default_handling_fee' => '10',
            'reservation_duration' => 'no_limit',
            'invoice_footer_note' => 'Thank you for mining!',
            'partial_payment_allowed' => 'false',
            'sales_count_basis' => 'paid_invoice',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(
                ['setting_key' => $key],
                ['setting_value' => $value]
            );
        }
    }
}

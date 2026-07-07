<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['GCash', 'Maya', 'Bank Transfer', 'Cash on Pickup', 'COD', 'Other'] as $name) {
            PaymentMethod::updateOrCreate(
                ['name' => $name],
                ['is_active' => true]
            );
        }
    }
}

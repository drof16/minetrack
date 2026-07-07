<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            ['location_name' => 'MhinTea Cafe, Babalag West', 'location_type' => 'pickup', 'fee' => 0],
            ['location_name' => 'Bulanao', 'location_type' => 'delivery_area', 'fee' => 0],
            ['location_name' => 'Nambaran', 'location_type' => 'delivery_area', 'fee' => 0],
            ['location_name' => 'Dagupan', 'location_type' => 'delivery_area', 'fee' => 0],
        ];

        foreach ($locations as $location) {
            Location::updateOrCreate(
                [
                    'location_name' => $location['location_name'],
                    'location_type' => $location['location_type'],
                ],
                $location + ['is_active' => true]
            );
        }
    }
}

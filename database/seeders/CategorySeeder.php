<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Thrift', 'code' => 'THR'],
            ['name' => 'Kitchenware', 'code' => 'KIT'],
            ['name' => 'Melamine', 'code' => 'MEL'],
            ['name' => 'Others', 'code' => 'OTH'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['code' => $category['code']], $category);
        }
    }
}

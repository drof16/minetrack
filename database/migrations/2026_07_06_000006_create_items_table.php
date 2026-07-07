<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table): void {
            $table->id();
            $table->string('item_code')->unique()->index();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('item_name');
            $table->text('description')->nullable();
            $table->string('condition')->nullable();
            $table->decimal('selling_price', 10, 2);
            $table->text('facebook_post_url')->nullable();
            $table->string('photo_path')->nullable();
            $table->string('status')->default('Available')->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};

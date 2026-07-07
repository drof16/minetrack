<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mines', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('mine_rank');
            $table->text('mine_text');
            $table->text('facebook_comment_url')->nullable();
            $table->timestamp('mine_time')->nullable();
            $table->string('source')->default('manual')->index();
            $table->string('status')->default('backup')->index();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['item_id', 'mine_rank']);
            $table->index(['item_id', 'status']);
            $table->index(['customer_id', 'status']);
            $table->unique(['item_id', 'mine_rank']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mines');
    }
};

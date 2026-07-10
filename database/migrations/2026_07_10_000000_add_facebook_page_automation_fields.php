<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('items', function (Blueprint $table): void {
            $table->string('facebook_post_id')->nullable()->after('facebook_post_url')->index();
        });

        Schema::table('customers', function (Blueprint $table): void {
            $table->string('facebook_user_id')->nullable()->after('facebook_profile_url')->index();
        });

        Schema::table('mines', function (Blueprint $table): void {
            $table->string('facebook_comment_id')->nullable()->after('facebook_comment_url')->unique();
        });
    }

    public function down(): void
    {
        Schema::table('mines', function (Blueprint $table): void {
            $table->dropUnique(['facebook_comment_id']);
            $table->dropColumn('facebook_comment_id');
        });

        Schema::table('customers', function (Blueprint $table): void {
            $table->dropColumn('facebook_user_id');
        });

        Schema::table('items', function (Blueprint $table): void {
            $table->dropColumn('facebook_post_id');
        });
    }
};

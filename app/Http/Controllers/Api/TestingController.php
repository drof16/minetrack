<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\HttpFoundation\Response;

class TestingController extends Controller
{
    public function resetDatabase(Request $request): JsonResponse
    {
        abort_unless(app()->environment(['local', 'testing']), Response::HTTP_NOT_FOUND);

        $request->validate([
            'confirmation' => ['required', 'in:RESET'],
        ]);

        Artisan::call('migrate:fresh', [
            '--seed' => true,
            '--force' => true,
        ]);

        return response()->json([
            'message' => 'Database reset to seeded state.',
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Services\FacebookPageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FacebookPageController extends Controller
{
    public function __construct(private readonly FacebookPageService $facebookPageService)
    {
    }

    public function status(): JsonResponse
    {
        return response()->json([
            'data' => $this->facebookPageService->status(),
        ]);
    }

    public function syncItemComments(Request $request, Item $item): JsonResponse
    {
        $data = $request->validate([
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        return response()->json([
            'data' => $this->facebookPageService->syncItemComments($item, $request->user(), $data['limit'] ?? 100),
        ]);
    }
}

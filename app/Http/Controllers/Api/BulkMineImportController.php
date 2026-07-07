<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BulkMineImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BulkMineImportController extends Controller
{
    public function __construct(private readonly BulkMineImportService $bulkMineImportService)
    {
    }

    public function preview(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        return response()->json([
            'data' => $this->bulkMineImportService->preview($data),
        ]);
    }

    public function process(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        return response()->json([
            'data' => $this->bulkMineImportService->process($data, $request->user()),
        ]);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'mine_texts' => ['required', 'string'],
            'default_item_id' => ['nullable', 'integer', 'exists:items,id'],
            'create_missing_customers' => ['sometimes', 'boolean'],
            'create_orders' => ['sometimes', 'boolean'],
            'generate_invoices' => ['sometimes', 'boolean'],
        ]);
    }
}

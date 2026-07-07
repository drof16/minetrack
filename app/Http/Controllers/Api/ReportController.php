<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Http\Resources\ItemResource;
use App\Http\Resources\OrderResource;
use App\Models\Invoice;
use App\Models\Item;
use App\Models\Order;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReportController extends Controller
{
    public function salesToday(): JsonResponse
    {
        return $this->salesBetween(CarbonImmutable::today(), CarbonImmutable::tomorrow());
    }

    public function salesWeekly(): JsonResponse
    {
        return $this->salesBetween(CarbonImmutable::today()->startOfWeek(), CarbonImmutable::today()->endOfWeek()->addSecond());
    }

    public function salesMonthly(): JsonResponse
    {
        return $this->salesBetween(CarbonImmutable::today()->startOfMonth(), CarbonImmutable::today()->endOfMonth()->addSecond());
    }

    public function paidInvoices(): AnonymousResourceCollection
    {
        return InvoiceResource::collection(
            Invoice::query()->with(['customer', 'order'])->where('payment_status', Invoice::PAYMENT_STATUS_PAID)->latest()->get()
        );
    }

    public function unpaidInvoices(): AnonymousResourceCollection
    {
        return InvoiceResource::collection(
            Invoice::query()->with(['customer', 'order'])->where('payment_status', Invoice::PAYMENT_STATUS_UNPAID)->latest()->get()
        );
    }

    public function soldItems(): AnonymousResourceCollection
    {
        return ItemResource::collection(
            Item::query()->with('category')->where('status', Item::STATUS_SOLD)->latest()->get()
        );
    }

    public function cancelledOrders(): AnonymousResourceCollection
    {
        return OrderResource::collection(
            Order::query()->with(['customer', 'location'])->where('order_status', 'Cancelled')->latest()->get()
        );
    }

    private function salesBetween($start, $end): JsonResponse
    {
        $query = Invoice::query()
            ->where('payment_status', Invoice::PAYMENT_STATUS_PAID)
            ->where('paid_at', '>=', $start)
            ->where('paid_at', '<', $end);

        return response()->json([
            'total_sales' => (clone $query)->sum('total_amount'),
            'invoice_count' => (clone $query)->count(),
            'from' => $start->toISOString(),
            'to' => $end->toISOString(),
        ]);
    }
}

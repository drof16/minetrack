<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StatusLogResource;
use App\Models\Invoice;
use App\Models\Item;
use App\Models\Order;
use App\Models\StatusLog;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DashboardController extends Controller
{
    public function metrics(): JsonResponse
    {
        $today = CarbonImmutable::today();
        $weekStart = $today->startOfWeek();
        $monthStart = $today->startOfMonth();

        $paidInvoices = Invoice::query()->where('payment_status', Invoice::PAYMENT_STATUS_PAID);

        return response()->json([
            'today_sales' => (clone $paidInvoices)->whereDate('paid_at', $today)->sum('total_amount'),
            'weekly_sales' => (clone $paidInvoices)->where('paid_at', '>=', $weekStart)->sum('total_amount'),
            'monthly_sales' => (clone $paidInvoices)->where('paid_at', '>=', $monthStart)->sum('total_amount'),
            'available_items' => Item::query()->where('status', 'Available')->count(),
            'mined_items' => Item::query()->where('status', 'Mined')->count(),
            'unpaid_invoices' => Invoice::query()->where('payment_status', Invoice::PAYMENT_STATUS_UNPAID)->count(),
            'for_packing_count' => Order::query()->where('order_status', 'For Packing')->count(),
            'for_pickup_count' => Order::query()->where('order_status', 'For Pickup')->count(),
            'for_delivery_count' => Order::query()->where('order_status', 'For Delivery')->count(),
            'sold_items_count' => Item::query()->where('status', 'Sold')->count(),
            'cancelled_items_orders_count' => Item::query()->where('status', 'Cancelled')->count()
                + Order::query()->where('order_status', 'Cancelled')->count(),
        ]);
    }

    public function recentActivity(): AnonymousResourceCollection
    {
        $logs = StatusLog::query()
            ->with('changedBy')
            ->latest('created_at')
            ->limit(20)
            ->get();

        return StatusLogResource::collection($logs);
    }
}

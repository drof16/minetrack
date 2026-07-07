<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\StoreOrderRequest;
use App\Http\Requests\Orders\UpdateOrderRequest;
use App\Http\Requests\Orders\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = Order::query()
            ->with(['customer', 'location'])
            ->when($request->filled('status'), fn ($query) => $query->where('order_status', $request->string('status')->toString()))
            ->when($request->filled('payment_status'), fn ($query) => $query->where('payment_status', $request->string('payment_status')->toString()))
            ->when($request->filled('customer_id'), fn ($query) => $query->where('customer_id', $request->integer('customer_id')))
            ->latest()
            ->paginate($request->integer('per_page', 25));

        return OrderResource::collection($orders);
    }

    public function store(StoreOrderRequest $request): OrderResource
    {
        return OrderResource::make(
            $this->orderService->create($request->validated(), $request->user())
        );
    }

    public function show(Order $order): OrderResource
    {
        return OrderResource::make($order->load(['customer', 'location', 'orderItems']));
    }

    public function update(UpdateOrderRequest $request, Order $order): OrderResource
    {
        return OrderResource::make(
            $this->orderService->update($order, $request->validated())
        );
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): OrderResource
    {
        $this->setStatus($order, $request->string('status')->toString(), $request->user(), $request->input('notes'));

        return OrderResource::make($order->load(['customer', 'location', 'orderItems']));
    }

    public function packingOrders(): AnonymousResourceCollection
    {
        return OrderResource::collection(
            Order::query()
                ->with(['customer', 'location', 'orderItems'])
                ->whereIn('order_status', ['Confirmed', 'Invoiced', 'For Packing'])
                ->latest()
                ->get()
        );
    }

    public function markPacked(Order $order, Request $request): OrderResource
    {
        $this->setStatus($order, 'Packed', $request->user(), 'Order marked packed.');

        return OrderResource::make($order->load(['customer', 'location', 'orderItems']));
    }

    public function markForPickup(Order $order, Request $request): OrderResource
    {
        $this->setStatus($order, 'For Pickup', $request->user(), 'Order marked for pickup.');

        return OrderResource::make($order->load(['customer', 'location', 'orderItems']));
    }

    public function markForDelivery(Order $order, Request $request): OrderResource
    {
        $this->setStatus($order, 'For Delivery', $request->user(), 'Order marked for delivery.');

        return OrderResource::make($order->load(['customer', 'location', 'orderItems']));
    }

    public function markPickedUp(Order $order, Request $request): OrderResource
    {
        $this->setStatus($order, 'Picked Up', $request->user(), 'Order picked up.');

        return OrderResource::make($order->load(['customer', 'location', 'orderItems']));
    }

    public function markDelivered(Order $order, Request $request): OrderResource
    {
        $this->setStatus($order, 'Delivered', $request->user(), 'Order delivered.');

        return OrderResource::make($order->load(['customer', 'location', 'orderItems']));
    }

    public function markCompleted(Order $order, Request $request): OrderResource
    {
        $this->setStatus($order, Order::STATUS_COMPLETED, $request->user(), 'Order completed.');

        return OrderResource::make($order->load(['customer', 'location', 'orderItems']));
    }

    private function setStatus(Order $order, string $status, $user = null, ?string $notes = null): void
    {
        $order->updateStatus($status, $user, $notes);

        if ($status === Order::STATUS_COMPLETED) {
            foreach ($order->orderItems()->with('item')->get() as $orderItem) {
                $orderItem->item?->updateStatus('Sold', $user, "Order {$order->order_number} completed.");
            }
        }
    }
}

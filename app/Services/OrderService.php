<?php

namespace App\Services;

use App\Models\Item;
use App\Models\Mine;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function create(array $data, ?User $user = null): Order
    {
        return DB::transaction(function () use ($data, $user): Order {
            $items = $this->validatedActiveMinedItems((int) $data['customer_id'], $data['item_ids']);
            $subtotal = $items->sum(fn (Item $item) => (float) $item->selling_price);
            $handlingFee = (float) ($data['handling_fee'] ?? 0);
            $deliveryFee = (float) ($data['delivery_fee'] ?? 0);
            $discount = (float) ($data['discount'] ?? 0);
            $total = max(0, $subtotal + $handlingFee + $deliveryFee - $discount);

            $order = Order::create([
                'order_number' => $this->nextOrderNumber(),
                'customer_id' => $data['customer_id'],
                'subtotal' => $subtotal,
                'handling_fee' => $handlingFee,
                'delivery_fee' => $deliveryFee,
                'discount' => $discount,
                'total_amount' => $total,
                'order_status' => Order::STATUS_DRAFT,
                'payment_status' => Order::PAYMENT_STATUS_UNPAID,
                'pickup_or_delivery_method' => $data['pickup_or_delivery_method'] ?? null,
                'location_id' => $data['location_id'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($items as $item) {
                $order->orderItems()->create([
                    'item_id' => $item->id,
                    'item_code' => $item->item_code,
                    'item_name' => $item->item_name,
                    'quantity' => 1,
                    'unit_price' => $item->selling_price,
                    'total_price' => $item->selling_price,
                ]);

                $item->updateStatus('Confirmed', $user, "Added to order {$order->order_number}.");
            }

            return $order->load(['customer', 'location', 'orderItems']);
        });
    }

    public function update(Order $order, array $data): Order
    {
        $subtotal = (float) $order->orderItems()->sum('total_price');
        $handlingFee = array_key_exists('handling_fee', $data) ? (float) $data['handling_fee'] : (float) $order->handling_fee;
        $deliveryFee = array_key_exists('delivery_fee', $data) ? (float) $data['delivery_fee'] : (float) $order->delivery_fee;
        $discount = array_key_exists('discount', $data) ? (float) $data['discount'] : (float) $order->discount;

        $order->update($data + [
            'subtotal' => $subtotal,
            'handling_fee' => $handlingFee,
            'delivery_fee' => $deliveryFee,
            'discount' => $discount,
            'total_amount' => max(0, $subtotal + $handlingFee + $deliveryFee - $discount),
        ]);

        return $order->load(['customer', 'location', 'orderItems']);
    }

    private function validatedActiveMinedItems(int $customerId, array $itemIds): Collection
    {
        $items = Item::query()
            ->with(['mines' => fn ($query) => $query->where('customer_id', $customerId)->where('status', Mine::STATUS_ACTIVE)])
            ->whereIn('id', $itemIds)
            ->get();

        if ($items->count() !== count(array_unique($itemIds))) {
            throw ValidationException::withMessages([
                'item_ids' => ['One or more selected items could not be found.'],
            ]);
        }

        $invalidItems = $items->filter(fn (Item $item) => $item->mines->isEmpty());
        if ($invalidItems->isNotEmpty()) {
            throw ValidationException::withMessages([
                'item_ids' => ['Selected items must be active mined items of the selected customer.'],
            ]);
        }

        return $items;
    }

    private function nextOrderNumber(): string
    {
        $prefix = 'ORD-'.now()->format('Ymd');
        $count = Order::query()->where('order_number', 'like', "{$prefix}-%")->count() + 1;

        return sprintf('%s-%04d', $prefix, $count);
    }
}

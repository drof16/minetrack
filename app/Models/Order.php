<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const STATUS_DRAFT = 'Draft';
    public const STATUS_COMPLETED = 'Completed';
    public const STATUSES = [
        'Draft',
        'Confirmed',
        'Invoiced',
        'For Packing',
        'Packed',
        'For Pickup',
        'For Delivery',
        'Picked Up',
        'Delivered',
        'Completed',
        'Cancelled',
    ];
    public const PAYMENT_STATUS_UNPAID = 'Unpaid';
    public const PAYMENT_STATUS_PAID = 'Paid';

    protected $fillable = [
        'order_number',
        'customer_id',
        'subtotal',
        'handling_fee',
        'delivery_fee',
        'discount',
        'total_amount',
        'order_status',
        'payment_status',
        'pickup_or_delivery_method',
        'location_id',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'handling_fee' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'discount' => 'decimal:2',
            'total_amount' => 'decimal:2',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    public function updateStatus(string $status, ?User $changedBy = null, ?string $notes = null): void
    {
        $oldStatus = $this->order_status;
        $this->forceFill(['order_status' => $status])->save();

        StatusLog::record('orders', $this->id, $oldStatus, $status, $changedBy?->id, $notes);
    }
}

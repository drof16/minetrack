<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const STATUS_DRAFT = 'Draft';
    public const STATUS_SENT = 'Sent';
    public const STATUS_PAID = 'Paid';
    public const STATUS_CANCELLED = 'Cancelled';
    public const PAYMENT_STATUS_UNPAID = 'Unpaid';
    public const PAYMENT_STATUS_PAID = 'Paid';
    public const PAYMENT_STATUS_CANCELLED = 'Cancelled';
    public const STATUSES = ['Draft', 'Sent', 'Unpaid', 'Paid', 'Cancelled', 'Refunded'];
    public const PAYMENT_STATUSES = ['Unpaid', 'Paid', 'Refunded', 'Cancelled'];

    protected $fillable = [
        'invoice_number',
        'order_id',
        'customer_id',
        'subtotal',
        'handling_fee',
        'delivery_fee',
        'discount',
        'total_amount',
        'amount_paid',
        'balance',
        'invoice_status',
        'payment_status',
        'pdf_path',
        'image_path',
        'issued_at',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'handling_fee' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'discount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'balance' => 'decimal:2',
            'issued_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function markPaid(?User $changedBy = null): void
    {
        $oldStatus = $this->payment_status;
        $this->forceFill([
            'payment_status' => self::PAYMENT_STATUS_PAID,
            'invoice_status' => self::STATUS_PAID,
            'amount_paid' => $this->total_amount,
            'balance' => 0,
            'paid_at' => now(),
        ])->save();

        StatusLog::record('invoices', $this->id, $oldStatus, self::PAYMENT_STATUS_PAID, $changedBy?->id, 'Invoice marked paid.');
    }
}

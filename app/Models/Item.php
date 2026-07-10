<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Item extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const STATUS_AVAILABLE = 'Available';
    public const STATUS_MINED = 'Mined';
    public const STATUS_SOLD = 'Sold';
    public const STATUSES = [
        'Available',
        'Mined',
        'Confirmed',
        'For Packing',
        'Packed',
        'For Pickup',
        'For Delivery',
        'Picked Up',
        'Delivered',
        'Sold',
        'Cancelled',
        'Unclaimed',
        'Returned',
        'Unavailable',
    ];

    protected $fillable = [
        'item_code',
        'category_id',
        'item_name',
        'description',
        'condition',
        'selling_price',
        'facebook_post_url',
        'facebook_post_id',
        'photo_path',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'selling_price' => 'decimal:2',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function mines(): HasMany
    {
        return $this->hasMany(Mine::class)->orderBy('mine_rank');
    }

    public function activeMine()
    {
        return $this->hasOne(Mine::class)->where('status', Mine::STATUS_ACTIVE);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function updateStatus(string $status, ?User $changedBy = null, ?string $notes = null): void
    {
        $oldStatus = $this->status;
        $this->forceFill(['status' => $status])->save();

        StatusLog::record('items', $this->id, $oldStatus, $status, $changedBy?->id, $notes);
    }
}

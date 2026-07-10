<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mine extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_BACKUP = 'backup';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_MOVED = 'moved';
    public const STATUSES = [
        self::STATUS_ACTIVE,
        self::STATUS_BACKUP,
        self::STATUS_CANCELLED,
        self::STATUS_MOVED,
    ];
    public const SOURCES = [
        'manual',
        'facebook_page',
        'facebook_profile',
        'facebook_group',
        'facebook_marketplace',
        'other',
    ];

    protected $fillable = [
        'item_id',
        'customer_id',
        'mine_rank',
        'mine_text',
        'facebook_comment_url',
        'facebook_comment_id',
        'mine_time',
        'source',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'mine_time' => 'datetime',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function containsMineKeyword(): bool
    {
        return self::textContainsMineKeyword($this->mine_text);
    }

    public static function textContainsMineKeyword(?string $text): bool
    {
        return str_contains(mb_strtolower((string) $text), 'mine');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StatusLog extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'module',
        'record_id',
        'old_status',
        'new_status',
        'changed_by',
        'notes',
    ];

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    public static function record(
        string $module,
        int $recordId,
        ?string $oldStatus,
        string $newStatus,
        ?int $changedBy = null,
        ?string $notes = null
    ): self {
        return self::create([
            'module' => $module,
            'record_id' => $recordId,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_by' => $changedBy,
            'notes' => $notes,
        ]);
    }
}

<?php

namespace App\Services;

use App\Models\Item;
use App\Models\Mine;
use App\Models\StatusLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MineService
{
    public function recordActiveMine(Item $item, array $data, ?User $user = null): Mine
    {
        return DB::transaction(function () use ($item, $data, $user): Mine {
            if ($item->mines()->where('status', Mine::STATUS_ACTIVE)->exists()) {
                throw ValidationException::withMessages([
                    'item_id' => ['This item already has an active miner. Add the customer as a backup miner instead.'],
                ]);
            }

            $mine = $this->createMine($item, $data, Mine::STATUS_ACTIVE);
            $this->markItemMined($item, $user, 'Active miner recorded.');

            StatusLog::record('mines', $mine->id, null, Mine::STATUS_ACTIVE, $user?->id, 'Active miner recorded.');

            return $mine->load(['item.category', 'customer']);
        });
    }

    public function recordBackupMine(Item $item, array $data, ?User $user = null): Mine
    {
        return DB::transaction(function () use ($item, $data, $user): Mine {
            if (! $item->mines()->where('status', Mine::STATUS_ACTIVE)->exists()) {
                throw ValidationException::withMessages([
                    'item_id' => ['Record an active miner before adding backup miners.'],
                ]);
            }

            $mine = $this->createMine($item, $data, Mine::STATUS_BACKUP);

            StatusLog::record('mines', $mine->id, null, Mine::STATUS_BACKUP, $user?->id, 'Backup miner recorded.');

            return $mine->load(['item.category', 'customer']);
        });
    }

    public function cancelMine(Mine $mine, ?User $user = null, ?string $notes = null): Mine
    {
        return DB::transaction(function () use ($mine, $user, $notes): Mine {
            if ($mine->status === Mine::STATUS_CANCELLED) {
                return $mine->load(['item.category', 'customer']);
            }

            $oldStatus = $mine->status;
            $mine->forceFill([
                'status' => Mine::STATUS_CANCELLED,
                'notes' => $notes ?: $mine->notes,
            ])->save();

            StatusLog::record('mines', $mine->id, $oldStatus, Mine::STATUS_CANCELLED, $user?->id, $notes ?: 'Mine cancelled.');

            return $mine->load(['item.category', 'customer']);
        });
    }

    public function moveToNextMiner(Item $item, ?User $user = null, ?string $notes = null): Mine
    {
        return DB::transaction(function () use ($item, $user, $notes): Mine {
            if ($item->mines()->where('status', Mine::STATUS_ACTIVE)->exists()) {
                throw ValidationException::withMessages([
                    'item_id' => ['Cancel the active miner before moving to the next backup miner.'],
                ]);
            }

            $nextMine = $item->mines()
                ->where('status', Mine::STATUS_BACKUP)
                ->orderBy('mine_rank')
                ->lockForUpdate()
                ->first();

            if (! $nextMine) {
                throw ValidationException::withMessages([
                    'item_id' => ['No backup miner is available for this item.'],
                ]);
            }

            $nextMine->forceFill([
                'status' => Mine::STATUS_ACTIVE,
                'notes' => $notes ?: $nextMine->notes,
            ])->save();

            $this->markItemMined($item, $user, 'Backup miner moved to active miner.');
            StatusLog::record('mines', $nextMine->id, Mine::STATUS_BACKUP, Mine::STATUS_ACTIVE, $user?->id, $notes ?: 'Backup miner moved to active miner.');

            return $nextMine->load(['item.category', 'customer']);
        });
    }

    private function createMine(Item $item, array $data, string $status): Mine
    {
        $nextRank = ((int) $item->mines()->max('mine_rank')) + 1;

        return $item->mines()->create([
            'customer_id' => $data['customer_id'],
            'mine_rank' => $nextRank,
            'mine_text' => $data['mine_text'],
            'facebook_comment_url' => $data['facebook_comment_url'] ?? null,
            'facebook_comment_id' => $data['facebook_comment_id'] ?? null,
            'mine_time' => $data['mine_time'] ?? now(),
            'source' => $data['source'] ?? 'manual',
            'status' => $status,
            'notes' => $data['notes'] ?? null,
        ]);
    }

    private function markItemMined(Item $item, ?User $user, string $notes): void
    {
        if ($item->status !== Item::STATUS_MINED) {
            $item->updateStatus(Item::STATUS_MINED, $user, $notes);
        }
    }
}

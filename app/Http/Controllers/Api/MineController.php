<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Mines\CancelMineRequest;
use App\Http\Requests\Mines\MoveToNextMinerRequest;
use App\Http\Requests\Mines\StoreMineRequest;
use App\Http\Resources\MineResource;
use App\Models\Item;
use App\Models\Mine;
use App\Services\MineService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MineController extends Controller
{
    public function __construct(private readonly MineService $mineService)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $mines = Mine::query()
            ->with(['item.category', 'customer'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->filled('item_id'), fn ($query) => $query->where('item_id', $request->integer('item_id')))
            ->when($request->filled('customer_id'), fn ($query) => $query->where('customer_id', $request->integer('customer_id')))
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 25));

        return MineResource::collection($mines);
    }

    public function store(StoreMineRequest $request, Item $item): MineResource
    {
        return MineResource::make(
            $this->mineService->recordActiveMine($item, $request->validated(), $request->user())
        );
    }

    public function storeBackup(StoreMineRequest $request, Item $item): MineResource
    {
        return MineResource::make(
            $this->mineService->recordBackupMine($item, $request->validated(), $request->user())
        );
    }

    public function cancel(CancelMineRequest $request, Mine $mine): MineResource
    {
        return MineResource::make(
            $this->mineService->cancelMine($mine, $request->user(), $request->input('notes'))
        );
    }

    public function moveToNextMiner(MoveToNextMinerRequest $request, Item $item): MineResource
    {
        return MineResource::make(
            $this->mineService->moveToNextMiner($item, $request->user(), $request->input('notes'))
        );
    }
}

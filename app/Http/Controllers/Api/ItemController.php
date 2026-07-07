<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Items\StoreItemRequest;
use App\Http\Requests\Items\UpdateItemRequest;
use App\Http\Requests\Items\UpdateItemStatusRequest;
use App\Http\Requests\Items\UploadItemPhotoRequest;
use App\Http\Resources\ItemResource;
use App\Http\Resources\MineResource;
use App\Http\Resources\StatusLogResource;
use App\Models\Item;
use App\Models\StatusLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class ItemController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $items = Item::query()
            ->with('category')
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search): void {
                    $query->where('item_code', 'like', "%{$search}%")
                        ->orWhere('item_name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('category_id'), fn ($query) => $query->where('category_id', $request->integer('category_id')))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return ItemResource::collection($items);
    }

    public function store(StoreItemRequest $request): ItemResource
    {
        $item = Item::create($request->validated() + [
            'status' => $request->input('status', Item::STATUS_AVAILABLE),
        ]);

        return ItemResource::make($item->load('category'));
    }

    public function show(Item $item): ItemResource
    {
        return ItemResource::make($item->load(['category', 'mines.customer']));
    }

    public function update(UpdateItemRequest $request, Item $item): ItemResource
    {
        $item->update($request->validated());

        return ItemResource::make($item->load('category'));
    }

    public function destroy(Item $item): JsonResponse
    {
        $item->delete();

        return response()->json([
            'message' => 'Item deleted.',
        ]);
    }

    public function uploadPhoto(UploadItemPhotoRequest $request, Item $item): ItemResource
    {
        if ($item->photo_path) {
            Storage::disk('public')->delete($item->photo_path);
        }

        $path = $request->file('photo')->store('items', 'public');
        $item->update(['photo_path' => $path]);

        return ItemResource::make($item->load('category'));
    }

    public function updateStatus(UpdateItemStatusRequest $request, Item $item): ItemResource
    {
        $item->updateStatus(
            $request->string('status')->toString(),
            $request->user(),
            $request->input('notes')
        );

        return ItemResource::make($item->load('category'));
    }

    public function mines(Item $item): AnonymousResourceCollection
    {
        return MineResource::collection(
            $item->mines()->with('customer')->get()
        );
    }

    public function statusLogs(Item $item): AnonymousResourceCollection
    {
        return StatusLogResource::collection(
            StatusLog::query()
                ->where('module', 'items')
                ->where('record_id', $item->id)
                ->with('changedBy')
                ->latest('created_at')
                ->get()
        );
    }
}

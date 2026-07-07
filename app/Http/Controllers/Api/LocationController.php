<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LocationController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return LocationResource::collection(
            Location::query()->where('is_active', true)->orderBy('location_type')->orderBy('location_name')->get()
        );
    }

    public function store(Request $request): LocationResource
    {
        $data = $request->validate([
            'location_name' => ['required', 'string', 'max:255'],
            'location_type' => ['required', 'in:pickup,dropoff,delivery_area'],
            'fee' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        return LocationResource::make(Location::create($data + ['fee' => 0, 'is_active' => true]));
    }

    public function update(Request $request, Location $location): LocationResource
    {
        $data = $request->validate([
            'location_name' => ['required', 'string', 'max:255'],
            'location_type' => ['required', 'in:pickup,dropoff,delivery_area'],
            'fee' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $location->update($data);

        return LocationResource::make($location);
    }

    public function destroy(Location $location): JsonResponse
    {
        $location->delete();

        return response()->json(['message' => 'Location deleted.']);
    }
}

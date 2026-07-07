<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customers\StoreCustomerRequest;
use App\Http\Requests\Customers\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\InvoiceResource;
use App\Http\Resources\ItemResource;
use App\Http\Resources\OrderResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $customers = Customer::query()
            ->withCount(['mines', 'orders', 'invoices'])
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('facebook_name', 'like', "%{$search}%")
                        ->orWhere('contact_number', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return CustomerResource::collection($customers);
    }

    public function store(StoreCustomerRequest $request): CustomerResource
    {
        return CustomerResource::make(Customer::create($request->validated()));
    }

    public function show(Customer $customer): CustomerResource
    {
        return CustomerResource::make($customer->loadCount(['mines', 'orders', 'invoices']));
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): CustomerResource
    {
        $customer->update($request->validated());

        return CustomerResource::make($customer->loadCount(['mines', 'orders', 'invoices']));
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();

        return response()->json([
            'message' => 'Customer deleted.',
        ]);
    }

    public function minedItems(Customer $customer): AnonymousResourceCollection
    {
        $items = $customer->mines()
            ->where('status', 'active')
            ->with(['item.category'])
            ->get()
            ->pluck('item')
            ->filter()
            ->values();

        return ItemResource::collection($items);
    }

    public function activeMinedItems(Customer $customer): AnonymousResourceCollection
    {
        return $this->minedItems($customer);
    }

    public function orders(Customer $customer): AnonymousResourceCollection
    {
        return OrderResource::collection(
            $customer->orders()->with('location')->latest()->get()
        );
    }

    public function invoices(Customer $customer): AnonymousResourceCollection
    {
        return InvoiceResource::collection(
            $customer->invoices()->latest()->get()
        );
    }
}

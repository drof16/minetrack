<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Item;
use App\Models\Mine;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BulkMineImportService
{
    public function __construct(
        private readonly MineService $mineService,
        private readonly OrderService $orderService,
        private readonly InvoiceService $invoiceService
    ) {
    }

    public function preview(array $data): array
    {
        $context = $this->context($data);

        return [
            'rows' => $this->parseRows($data, $context)->values()->all(),
            'summary' => $this->summary($this->parseRows($data, $context)),
        ];
    }

    public function process(array $data, ?User $user = null): array
    {
        $context = $this->context($data);
        $rows = $this->parseRows($data, $context);
        $successfulRows = collect();
        $createdCustomers = collect();
        $createdOrders = collect();
        $createdInvoices = collect();

        DB::transaction(function () use ($data, $rows, $user, $successfulRows, $createdCustomers, $createdOrders, $createdInvoices): void {
            foreach ($rows as $row) {
                if (! $row['can_process']) {
                    continue;
                }

                $customer = $row['customer']['id']
                    ? Customer::find($row['customer']['id'])
                    : null;

                if (! $customer && ($data['create_missing_customers'] ?? false)) {
                    $customer = Customer::create([
                        'name' => $row['customer']['name'],
                        'facebook_name' => $row['customer']['name'],
                        'notes' => 'Created from bulk mine import.',
                    ]);
                    $createdCustomers->push($customer);
                }

                if (! $customer) {
                    $row['status'] = 'skipped';
                    $row['messages'][] = 'Customer was not created.';
                    $successfulRows->push($row);
                    continue;
                }

                $item = Item::find($row['item']['id']);
                if (! $item) {
                    $row['status'] = 'skipped';
                    $row['messages'][] = 'Item was not found.';
                    $successfulRows->push($row);
                    continue;
                }

                try {
                    $action = $item->mines()->where('status', Mine::STATUS_ACTIVE)->exists() ? 'backup' : 'active';
                    $payload = [
                        'customer_id' => $customer->id,
                        'mine_text' => $row['mine_text'],
                        'source' => 'manual',
                        'notes' => 'Created from bulk mine import.',
                    ];

                    $mine = $action === 'backup'
                        ? $this->mineService->recordBackupMine($item, $payload, $user)
                        : $this->mineService->recordActiveMine($item, $payload, $user);

                    $row['status'] = 'created';
                    $row['action'] = $action;
                    $row['mine_id'] = $mine->id;
                    $row['customer'] = [
                        'id' => $customer->id,
                        'name' => $customer->name,
                        'matched' => true,
                        'created' => $createdCustomers->contains('id', $customer->id),
                    ];
                    $row['messages'][] = $row['action'] === 'backup' ? 'Backup miner added.' : 'Active miner added.';
                    $successfulRows->push($row);
                } catch (ValidationException $exception) {
                    $row['status'] = 'skipped';
                    $row['messages'][] = collect($exception->errors())->flatten()->first() ?: 'Mine could not be created.';
                    $successfulRows->push($row);
                }
            }

            if ($data['create_orders'] ?? false) {
                $byCustomer = $successfulRows
                    ->where('status', 'created')
                    ->where('action', 'active')
                    ->groupBy('customer.id');

                foreach ($byCustomer as $customerId => $customerRows) {
                    $itemIds = $customerRows->pluck('item.id')->filter()->unique()->values()->all();
                    if (! $customerId || count($itemIds) === 0) {
                        continue;
                    }

                    $order = $this->orderService->create([
                        'customer_id' => (int) $customerId,
                        'item_ids' => $itemIds,
                        'handling_fee' => $this->defaultHandlingFee(),
                        'delivery_fee' => 0,
                        'discount' => 0,
                        'pickup_or_delivery_method' => 'To confirm',
                        'notes' => 'Auto-created from bulk mine import.',
                    ], $user);
                    $createdOrders->push($order);

                    if ($data['generate_invoices'] ?? false) {
                        $createdInvoices->push($this->invoiceService->generateFromOrder($order, $user));
                    }
                }
            }
        });

        return [
            'rows' => $successfulRows->values()->all(),
            'created_customers' => $createdCustomers->map(fn (Customer $customer) => [
                'id' => $customer->id,
                'name' => $customer->name,
            ])->values()->all(),
            'created_orders' => $createdOrders->map(fn ($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_id' => $order->customer_id,
                'total_amount' => $order->total_amount,
            ])->values()->all(),
            'created_invoices' => $createdInvoices->map(fn ($invoice) => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'order_id' => $invoice->order_id,
                'total_amount' => $invoice->total_amount,
            ])->values()->all(),
        ];
    }

    private function context(array $data): array
    {
        $items = Item::query()
            ->withCount(['mines as active_mines_count' => fn ($query) => $query->where('status', Mine::STATUS_ACTIVE)])
            ->get();

        $customers = Customer::query()->get();
        $defaultItem = isset($data['default_item_id']) ? $items->firstWhere('id', (int) $data['default_item_id']) : null;

        return [
            'items' => $items,
            'item_codes' => $items->keyBy(fn (Item $item) => Str::lower($item->item_code)),
            'customers' => $customers,
            'customers_by_name' => $customers->keyBy(fn (Customer $customer) => $this->normalizeName($customer->name)),
            'customers_by_facebook' => $customers->filter(fn (Customer $customer) => filled($customer->facebook_name))
                ->keyBy(fn (Customer $customer) => $this->normalizeName($customer->facebook_name)),
            'default_item' => $defaultItem,
            'create_missing_customers' => (bool) ($data['create_missing_customers'] ?? false),
        ];
    }

    private function parseRows(array $data, array $context): Collection
    {
        return collect(preg_split('/\r\n|\r|\n/', (string) ($data['mine_texts'] ?? '')))
            ->map(fn (string $line) => trim($line))
            ->filter()
            ->values()
            ->map(fn (string $line, int $index) => $this->parseRow($line, $index + 1, $context));
    }

    private function parseRow(string $line, int $lineNumber, array $context): array
    {
        $messages = [];
        $item = $this->detectItem($line, $context);
        $customerName = $this->detectCustomerName($line, $item);
        $customer = $this->detectCustomer($customerName, $context);
        $containsMine = Mine::textContainsMineKeyword($line);
        $action = null;

        if (! $containsMine) {
            $messages[] = 'Line does not contain the word mine.';
        }

        if (! $item) {
            $messages[] = 'No item code matched. Select a default item or include an item code.';
        }

        if (! $customerName) {
            $messages[] = 'No customer name was detected.';
        }

        if ($customerName && ! $customer && ! $context['create_missing_customers']) {
            $messages[] = 'Customer was not found. Enable auto-create customers to process this line.';
        }

        if ($item) {
            $action = ((int) $item->active_mines_count) > 0 ? 'backup' : 'active';
        }

        return [
            'line_number' => $lineNumber,
            'raw_text' => $line,
            'mine_text' => $containsMine ? $line : "mine {$line}",
            'item' => $item ? [
                'id' => $item->id,
                'item_code' => $item->item_code,
                'item_name' => $item->item_name,
                'status' => $item->status,
                'active_mines_count' => (int) $item->active_mines_count,
            ] : null,
            'customer' => [
                'id' => $customer?->id,
                'name' => $customer?->name ?: $customerName,
                'matched' => (bool) $customer,
                'created' => false,
            ],
            'action' => $action,
            'can_process' => $containsMine && $item && $customerName && ($customer || $context['create_missing_customers']),
            'status' => 'preview',
            'messages' => $messages,
        ];
    }

    private function detectItem(string $line, array $context): ?Item
    {
        foreach ($context['item_codes'] as $code => $item) {
            if (preg_match('/(^|[\s,;:\-\[\]\(\)#])'.preg_quote($code, '/').'($|[\s,;:\-\[\]\(\)#])/i', $line)) {
                return $item;
            }
        }

        return $context['default_item'];
    }

    private function detectCustomerName(string $line, ?Item $item): string
    {
        $name = preg_replace('/https?:\/\/\S+/i', ' ', $line);

        if ($item) {
            $name = preg_replace('/(^|[\s,;:\-\[\]\(\)#])'.preg_quote($item->item_code, '/').'($|[\s,;:\-\[\]\(\)#])/i', ' ', $name);
        }

        $name = preg_replace('/\bmine(?:d|s|ing)?\b/i', ' ', $name);
        $name = preg_replace('/\bff\b|\bup\b|\bbackup\b/i', ' ', $name);
        $name = preg_replace('/[-|:;,#\[\]\(\)]+/', ' ', $name);
        $name = preg_replace('/\s+/', ' ', trim($name));

        return Str::limit($name, 255, '');
    }

    private function detectCustomer(string $customerName, array $context): ?Customer
    {
        $key = $this->normalizeName($customerName);

        return $context['customers_by_name']->get($key)
            ?: $context['customers_by_facebook']->get($key);
    }

    private function normalizeName(?string $name): string
    {
        return preg_replace('/\s+/', ' ', Str::lower(trim((string) $name)));
    }

    private function summary(Collection $rows): array
    {
        return [
            'total_lines' => $rows->count(),
            'ready' => $rows->where('can_process', true)->count(),
            'needs_attention' => $rows->where('can_process', false)->count(),
            'active_mines' => $rows->where('action', 'active')->where('can_process', true)->count(),
            'backup_mines' => $rows->where('action', 'backup')->where('can_process', true)->count(),
        ];
    }

    private function defaultHandlingFee(): float
    {
        return (float) (Setting::query()->where('setting_key', 'default_handling_fee')->value('setting_value') ?: 0);
    }
}

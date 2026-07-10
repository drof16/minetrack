<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\BulkMineImportController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FacebookPageController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\MineController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\TestingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware(['web', 'guest']);

Route::middleware(['web', 'auth:sanctum'])->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', fn (Request $request) => $request->user());

    Route::get('/dashboard/metrics', [DashboardController::class, 'metrics']);
    Route::get('/dashboard/recent-activity', [DashboardController::class, 'recentActivity']);

    Route::get('/settings', [SettingController::class, 'index']);
    Route::put('/settings', [SettingController::class, 'update']);
    Route::apiResource('categories', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::apiResource('locations', LocationController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::get('/payment-methods', [PaymentMethodController::class, 'index']);
    Route::post('/payment-methods', [PaymentMethodController::class, 'store']);
    Route::put('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update']);
    Route::delete('/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'destroy']);

    Route::apiResource('items', ItemController::class);
    Route::post('/items/{item}/upload-photo', [ItemController::class, 'uploadPhoto']);
    Route::patch('/items/{item}/status', [ItemController::class, 'updateStatus']);
    Route::get('/items/{item}/mines', [ItemController::class, 'mines']);
    Route::get('/items/{item}/status-logs', [ItemController::class, 'statusLogs']);

    Route::get('/mines', [MineController::class, 'index']);
    Route::post('/items/{item}/mines', [MineController::class, 'store']);
    Route::post('/items/{item}/backup-mines', [MineController::class, 'storeBackup']);
    Route::patch('/mines/{mine}/cancel', [MineController::class, 'cancel']);
    Route::post('/items/{item}/move-to-next-miner', [MineController::class, 'moveToNextMiner']);
    Route::post('/bulk-mines/preview', [BulkMineImportController::class, 'preview']);
    Route::post('/bulk-mines/process', [BulkMineImportController::class, 'process']);
    Route::get('/facebook-page/status', [FacebookPageController::class, 'status']);
    Route::post('/items/{item}/facebook-page/sync-comments', [FacebookPageController::class, 'syncItemComments']);

    Route::apiResource('customers', CustomerController::class);
    Route::get('/customers/{customer}/mined-items', [CustomerController::class, 'minedItems']);
    Route::get('/customers/{customer}/active-mined-items', [CustomerController::class, 'activeMinedItems']);
    Route::get('/customers/{customer}/orders', [CustomerController::class, 'orders']);
    Route::get('/customers/{customer}/invoices', [CustomerController::class, 'invoices']);

    Route::apiResource('orders', OrderController::class)->except(['destroy']);
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::get('/packing/orders', [OrderController::class, 'packingOrders']);
    Route::patch('/orders/{order}/mark-packed', [OrderController::class, 'markPacked']);
    Route::patch('/orders/{order}/mark-for-pickup', [OrderController::class, 'markForPickup']);
    Route::patch('/orders/{order}/mark-for-delivery', [OrderController::class, 'markForDelivery']);
    Route::patch('/orders/{order}/mark-picked-up', [OrderController::class, 'markPickedUp']);
    Route::patch('/orders/{order}/mark-delivered', [OrderController::class, 'markDelivered']);
    Route::patch('/orders/{order}/mark-completed', [OrderController::class, 'markCompleted']);

    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::post('/orders/{order}/generate-invoice', [InvoiceController::class, 'generate']);
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);
    Route::get('/invoices/{invoice}/pdf', [InvoiceController::class, 'pdf']);
    Route::get('/invoices/{invoice}/image', [InvoiceController::class, 'image']);
    Route::patch('/invoices/{invoice}/mark-sent', [InvoiceController::class, 'markSent']);
    Route::patch('/invoices/{invoice}/cancel', [InvoiceController::class, 'cancel']);

    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/invoices/{invoice}/payments', [PaymentController::class, 'store']);
    Route::post('/payments/{payment}/upload-proof', [PaymentController::class, 'uploadProof']);

    Route::get('/reports/sales/today', [ReportController::class, 'salesToday']);
    Route::get('/reports/sales/weekly', [ReportController::class, 'salesWeekly']);
    Route::get('/reports/sales/monthly', [ReportController::class, 'salesMonthly']);
    Route::get('/reports/invoices/paid', [ReportController::class, 'paidInvoices']);
    Route::get('/reports/invoices/unpaid', [ReportController::class, 'unpaidInvoices']);
    Route::get('/reports/items/sold', [ReportController::class, 'soldItems']);
    Route::get('/reports/orders/cancelled', [ReportController::class, 'cancelledOrders']);

    Route::post('/testing/reset-database', [TestingController::class, 'resetDatabase']);
});

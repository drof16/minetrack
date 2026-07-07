import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { api } from '@/lib/api';
import AppLayout from '@/layouts/AppLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import CustomerDetailPage from '@/pages/customers/CustomerDetailPage';
import CustomerFormPage from '@/pages/customers/CustomerFormPage';
import CustomersPage from '@/pages/customers/CustomersPage';
import ItemDetailPage from '@/pages/items/ItemDetailPage';
import ItemFormPage from '@/pages/items/ItemFormPage';
import ItemsPage from '@/pages/items/ItemsPage';
import InvoiceDetailPage from '@/pages/invoices/InvoiceDetailPage';
import InvoicesPage from '@/pages/invoices/InvoicesPage';
import MineTrackerPage from '@/pages/mines/MineTrackerPage';
import QuickImportPage from '@/pages/mines/QuickImportPage';
import CreateOrderPage from '@/pages/orders/CreateOrderPage';
import OrderDetailPage from '@/pages/orders/OrderDetailPage';
import OrdersPage from '@/pages/orders/OrdersPage';
import PickupDeliveryPage from '@/pages/delivery/PickupDeliveryPage';
import PackingPage from '@/pages/packing/PackingPage';
import PaymentsPage from '@/pages/payments/PaymentsPage';
import ReportsPage from '@/pages/reports/ReportsPage';
import SettingsPage from '@/pages/settings/SettingsPage';

function App() {
    const path = window.location.pathname;
    const [user, setUser] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(path !== '/login');

    useEffect(() => {
        if (path === '/login') {
            return;
        }

        api.get('/user')
            .then((response) => setUser(response.data))
            .finally(() => setIsCheckingAuth(false));
    }, [path]);

    if (path === '/login') {
        return <LoginPage />;
    }

    if (isCheckingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm text-muted-foreground">
                Loading MineTrack...
            </div>
        );
    }

    if (path === '/items') {
        return (
            <AppLayout title="Items" user={user}>
                <ItemsPage />
            </AppLayout>
        );
    }

    if (path === '/mine-tracker') {
        return (
            <AppLayout title="Mine Tracker" user={user}>
                <MineTrackerPage />
            </AppLayout>
        );
    }

    if (path === '/quick-import') {
        return (
            <AppLayout title="Quick Import" user={user}>
                <QuickImportPage />
            </AppLayout>
        );
    }

    if (path === '/orders') {
        return (
            <AppLayout title="Orders" user={user}>
                <OrdersPage />
            </AppLayout>
        );
    }

    if (path === '/orders/new') {
        return (
            <AppLayout title="Create Order" user={user}>
                <CreateOrderPage />
            </AppLayout>
        );
    }

    const orderDetailMatch = path.match(/^\/orders\/(\d+)$/);
    if (orderDetailMatch) {
        return (
            <AppLayout title="Order Detail" user={user}>
                <OrderDetailPage orderId={orderDetailMatch[1]} />
            </AppLayout>
        );
    }

    if (path === '/invoices') {
        return (
            <AppLayout title="Invoices" user={user}>
                <InvoicesPage />
            </AppLayout>
        );
    }

    const invoiceDetailMatch = path.match(/^\/invoices\/(\d+)$/);
    if (invoiceDetailMatch) {
        return (
            <AppLayout title="Invoice Detail" user={user}>
                <InvoiceDetailPage invoiceId={invoiceDetailMatch[1]} />
            </AppLayout>
        );
    }

    if (path === '/payments') {
        return (
            <AppLayout title="Payments" user={user}>
                <PaymentsPage />
            </AppLayout>
        );
    }

    if (path === '/packing') {
        return (
            <AppLayout title="Packing" user={user}>
                <PackingPage />
            </AppLayout>
        );
    }

    if (path === '/pickup-delivery') {
        return (
            <AppLayout title="Pickup / Delivery" user={user}>
                <PickupDeliveryPage />
            </AppLayout>
        );
    }

    if (path === '/reports') {
        return (
            <AppLayout title="Reports" user={user}>
                <ReportsPage />
            </AppLayout>
        );
    }

    if (path === '/settings') {
        return (
            <AppLayout title="Settings" user={user}>
                <SettingsPage />
            </AppLayout>
        );
    }

    if (path === '/items/new') {
        return (
            <AppLayout title="Add Item" user={user}>
                <ItemFormPage />
            </AppLayout>
        );
    }

    const itemEditMatch = path.match(/^\/items\/(\d+)\/edit$/);
    if (itemEditMatch) {
        return (
            <AppLayout title="Edit Item" user={user}>
                <ItemFormPage itemId={itemEditMatch[1]} />
            </AppLayout>
        );
    }

    const itemDetailMatch = path.match(/^\/items\/(\d+)$/);
    if (itemDetailMatch) {
        return (
            <AppLayout title="Item Detail" user={user}>
                <ItemDetailPage itemId={itemDetailMatch[1]} />
            </AppLayout>
        );
    }

    if (path === '/customers') {
        return (
            <AppLayout title="Customers" user={user}>
                <CustomersPage />
            </AppLayout>
        );
    }

    if (path === '/customers/new') {
        return (
            <AppLayout title="Add Customer" user={user}>
                <CustomerFormPage />
            </AppLayout>
        );
    }

    const customerEditMatch = path.match(/^\/customers\/(\d+)\/edit$/);
    if (customerEditMatch) {
        return (
            <AppLayout title="Edit Customer" user={user}>
                <CustomerFormPage customerId={customerEditMatch[1]} />
            </AppLayout>
        );
    }

    const customerDetailMatch = path.match(/^\/customers\/(\d+)$/);
    if (customerDetailMatch) {
        return (
            <AppLayout title="Customer Detail" user={user}>
                <CustomerDetailPage customerId={customerDetailMatch[1]} />
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Dashboard" user={user}>
            <DashboardPage />
        </AppLayout>
    );
}

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    });
}

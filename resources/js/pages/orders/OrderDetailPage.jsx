import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const statuses = ['Draft', 'Confirmed', 'Invoiced', 'For Packing', 'Packed', 'For Pickup', 'For Delivery', 'Picked Up', 'Delivered', 'Completed', 'Cancelled'];

export default function OrderDetailPage({ orderId }) {
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    async function loadOrder() {
        try {
            const response = await api.get(`/orders/${orderId}`);
            setOrder(response.data.data);
            setStatus(response.data.data.order_status);
        } catch (exception) {
            setError(exception.response?.data?.message || 'Order could not be loaded.');
        }
    }

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    async function updateStatus() {
        try {
            await api.patch(`/orders/${orderId}/status`, { status });
            await loadOrder();
        } catch (exception) {
            setError(exception.response?.data?.message || 'Order status could not be updated.');
        }
    }

    async function generateInvoice() {
        try {
            const response = await api.post(`/orders/${orderId}/generate-invoice`);
            window.location.assign(`/invoices/${response.data.data.id}`);
        } catch (exception) {
            setError(exception.response?.data?.message || 'Invoice could not be generated.');
        }
    }

    if (!order) {
        return <p className="text-sm text-muted-foreground">{error || 'Loading order...'}</p>;
    }

    return (
        <div className="space-y-6">
            <Button type="button" variant="ghost" onClick={() => window.location.assign('/orders')}>
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>
            {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
            <Card>
                <CardHeader>
                    <CardTitle>{order.order_number}</CardTitle>
                    <CardDescription>{order.customer?.name || '-'} · {order.payment_status}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-4">
                        <Info label="Subtotal" value={`PHP ${Number(order.subtotal || 0).toFixed(2)}`} />
                        <Info label="Handling" value={`PHP ${Number(order.handling_fee || 0).toFixed(2)}`} />
                        <Info label="Delivery" value={`PHP ${Number(order.delivery_fee || 0).toFixed(2)}`} />
                        <Info label="Total" value={`PHP ${Number(order.total_amount || 0).toFixed(2)}`} />
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
                            {statuses.map((statusOption) => <option key={statusOption} value={statusOption}>{statusOption}</option>)}
                        </select>
                        <Button type="button" onClick={updateStatus}>Update status</Button>
                        <Button type="button" variant="outline" onClick={generateInvoice}>Generate invoice</Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Order items</CardTitle>
                    <CardDescription>Snapshot of selected mined items.</CardDescription>
                </CardHeader>
                <CardContent className="divide-y">
                    {order.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-3 text-sm">
                            <div>
                                <div className="font-medium">{item.item_code}</div>
                                <div className="text-muted-foreground">{item.item_name}</div>
                            </div>
                            <div>PHP {Number(item.total_price || 0).toFixed(2)}</div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-1 text-sm font-medium">{value}</div>
        </div>
    );
}

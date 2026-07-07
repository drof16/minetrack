import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/orders')
            .then((response) => setOrders(response.data.data || []))
            .catch((exception) => setError(exception.response?.data?.message || 'Orders are not available yet.'));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-normal">Orders</h2>
                    <p className="text-sm text-muted-foreground">Group a customer&apos;s mined items into one order.</p>
                </div>
                <Button type="button" onClick={() => window.location.assign('/orders/new')}>
                    <Plus className="h-4 w-4" />
                    Create order
                </Button>
            </div>
            {error ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</div> : null}
            <Card>
                <CardHeader>
                    <CardTitle>Order list</CardTitle>
                    <CardDescription>Recent customer orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-hidden rounded-lg border">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Order</th>
                                    <th className="px-4 py-3 font-medium">Customer</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Payment</th>
                                    <th className="px-4 py-3 font-medium">Total</th>
                                    <th className="px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.length === 0 ? (
                                    <tr><td className="px-4 py-6 text-muted-foreground" colSpan="6">No orders yet.</td></tr>
                                ) : orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-3 font-medium">{order.order_number}</td>
                                        <td className="px-4 py-3">{order.customer?.name || '-'}</td>
                                        <td className="px-4 py-3">{order.order_status}</td>
                                        <td className="px-4 py-3">{order.payment_status}</td>
                                        <td className="px-4 py-3">PHP {Number(order.total_amount || 0).toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <Button type="button" variant="outline" size="sm" onClick={() => window.location.assign(`/orders/${order.id}`)}>View</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

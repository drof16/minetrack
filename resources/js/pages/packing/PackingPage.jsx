import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PackingPage() {
    const [orders, setOrders] = useState([]);

    async function loadOrders() {
        const response = await api.get('/packing/orders');
        setOrders(response.data.data || []);
    }

    useEffect(() => {
        loadOrders().catch(() => setOrders([]));
    }, []);

    async function markPacked(orderId) {
        await api.patch(`/orders/${orderId}/mark-packed`);
        await loadOrders();
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-normal">Packing</h2>
                <p className="text-sm text-muted-foreground">Checklist of orders ready to pack.</p>
            </div>
            <div className="space-y-4">
                {orders.length === 0 ? <Card><CardContent className="p-6 text-sm text-muted-foreground">No orders for packing.</CardContent></Card> : orders.map((order) => (
                    <Card key={order.id}>
                        <CardHeader>
                            <CardTitle>{order.order_number}</CardTitle>
                            <CardDescription>{order.customer?.name || '-'} · {order.order_status}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="divide-y rounded-md border">
                                {order.order_items?.map((item) => (
                                    <label key={item.id} className="flex items-center gap-3 p-3 text-sm">
                                        <input type="checkbox" />
                                        <span>{item.item_code} · {item.item_name}</span>
                                    </label>
                                ))}
                            </div>
                            <Button type="button" onClick={() => markPacked(order.id)}>Mark packed</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

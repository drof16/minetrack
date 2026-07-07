import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const actionMap = [
    ['Packed', 'mark-for-pickup', 'For pickup'],
    ['Packed', 'mark-for-delivery', 'For delivery'],
    ['For Pickup', 'mark-picked-up', 'Picked up'],
    ['For Delivery', 'mark-delivered', 'Delivered'],
    ['Picked Up', 'mark-completed', 'Complete'],
    ['Delivered', 'mark-completed', 'Complete'],
];

export default function PickupDeliveryPage() {
    const [orders, setOrders] = useState([]);

    async function loadOrders() {
        const response = await api.get('/orders', { params: { per_page: 100 } });
        setOrders((response.data.data || []).filter((order) => ['Packed', 'For Pickup', 'For Delivery', 'Picked Up', 'Delivered'].includes(order.order_status)));
    }

    useEffect(() => {
        loadOrders().catch(() => setOrders([]));
    }, []);

    async function runAction(orderId, action) {
        await api.patch(`/orders/${orderId}/${action}`);
        await loadOrders();
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-normal">Pickup / Delivery</h2>
                <p className="text-sm text-muted-foreground">Move packed orders through pickup, delivery, and completion.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                {orders.length === 0 ? <Card><CardContent className="p-6 text-sm text-muted-foreground">No pickup or delivery orders.</CardContent></Card> : orders.map((order) => (
                    <Card key={order.id}>
                        <CardHeader>
                            <CardTitle>{order.order_number}</CardTitle>
                            <CardDescription>{order.customer?.name || '-'} · {order.order_status}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm text-muted-foreground">{order.location?.location_name || 'No location selected'}</div>
                            <div className="flex flex-wrap gap-2">
                                {actionMap.filter(([status]) => status === order.order_status).map(([, action, label]) => (
                                    <Button key={action} type="button" variant="outline" onClick={() => runAction(order.id, action)}>{label}</Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

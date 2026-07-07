import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportsPage() {
    const [sales, setSales] = useState({ today: {}, weekly: {}, monthly: {} });
    const [paid, setPaid] = useState([]);
    const [unpaid, setUnpaid] = useState([]);
    const [sold, setSold] = useState([]);
    const [cancelled, setCancelled] = useState([]);

    useEffect(() => {
        Promise.all([
            api.get('/reports/sales/today'),
            api.get('/reports/sales/weekly'),
            api.get('/reports/sales/monthly'),
            api.get('/reports/invoices/paid'),
            api.get('/reports/invoices/unpaid'),
            api.get('/reports/items/sold'),
            api.get('/reports/orders/cancelled'),
        ]).then(([today, weekly, monthly, paidInvoices, unpaidInvoices, soldItems, cancelledOrders]) => {
            setSales({ today: today.data, weekly: weekly.data, monthly: monthly.data });
            setPaid(paidInvoices.data.data || []);
            setUnpaid(unpaidInvoices.data.data || []);
            setSold(soldItems.data.data || []);
            setCancelled(cancelledOrders.data.data || []);
        }).catch(() => {});
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-normal">Reports</h2>
                <p className="text-sm text-muted-foreground">Sales count only paid invoices.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <SalesCard title="Today" data={sales.today} />
                <SalesCard title="This week" data={sales.weekly} />
                <SalesCard title="This month" data={sales.monthly} />
            </div>
            <div className="grid gap-4 md:grid-cols-4">
                <CountCard title="Paid invoices" value={paid.length} />
                <CountCard title="Unpaid invoices" value={unpaid.length} />
                <CountCard title="Sold items" value={sold.length} />
                <CountCard title="Cancelled orders" value={cancelled.length} />
            </div>
        </div>
    );
}

function SalesCard({ title, data }) {
    return (
        <Card>
            <CardHeader><CardDescription>{title}</CardDescription></CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold tracking-normal">PHP {Number(data.total_sales || 0).toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">{data.invoice_count || 0} paid invoices</div>
            </CardContent>
        </Card>
    );
}

function CountCard({ title, value }) {
    return (
        <Card>
            <CardHeader><CardDescription>{title}</CardDescription></CardHeader>
            <CardContent><div className="text-2xl font-semibold tracking-normal">{value}</div></CardContent>
        </Card>
    );
}

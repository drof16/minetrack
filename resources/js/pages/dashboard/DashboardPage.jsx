import { useEffect, useState } from 'react';
import { Boxes, CircleDollarSign, Package, ReceiptText, Truck } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const metricConfig = [
    ['today_sales', "Today's sales", CircleDollarSign, 'currency'],
    ['weekly_sales', "This week's sales", CircleDollarSign, 'currency'],
    ['monthly_sales', "This month's sales", CircleDollarSign, 'currency'],
    ['available_items', 'Available items', Package],
    ['mined_items', 'Mined items', Package],
    ['unpaid_invoices', 'Unpaid invoices', ReceiptText],
    ['for_packing_count', 'For packing', Boxes],
    ['for_pickup_count', 'For pickup', Truck],
    ['for_delivery_count', 'For delivery', Truck],
    ['sold_items_count', 'Sold items', Package],
];

function formatValue(value, type) {
    if (type === 'currency') {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(Number(value || 0));
    }

    return Number(value || 0).toLocaleString();
}

export default function DashboardPage() {
    const [metrics, setMetrics] = useState({});
    const [activity, setActivity] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [metricsResponse, activityResponse] = await Promise.all([
                    api.get('/dashboard/metrics'),
                    api.get('/dashboard/recent-activity'),
                ]);

                setMetrics(metricsResponse.data);
                setActivity(activityResponse.data.data || []);
            } catch (exception) {
                setError(exception.response?.data?.message || 'Dashboard data is not available yet.');
            } finally {
                setIsLoading(false);
            }
        }

        loadDashboard();
    }, []);

    return (
        <div className="space-y-6">
            {error ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</div> : null}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {metricConfig.map(([key, label, Icon, type]) => (
                    <Card key={key}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardDescription>{label}</CardDescription>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold tracking-normal">
                                {isLoading ? '...' : formatValue(metrics[key], type)}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Recent activity</CardTitle>
                    <CardDescription>Status changes will appear here as workflows move.</CardDescription>
                </CardHeader>
                <CardContent>
                    {activity.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
                    ) : (
                        <div className="divide-y">
                            {activity.map((log) => (
                                <div key={log.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                                    <div>
                                        <div className="font-medium">{log.module} #{log.record_id}</div>
                                        <div className="text-muted-foreground">
                                            {log.old_status || 'New'} to {log.new_status}
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-muted-foreground">{log.created_at}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

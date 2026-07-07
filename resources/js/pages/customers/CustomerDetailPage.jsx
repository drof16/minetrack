import { useEffect, useState } from 'react';
import { ArrowLeft, Edit } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomerDetailPage({ customerId }) {
    const [customer, setCustomer] = useState(null);
    const [minedItems, setMinedItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadCustomer() {
            try {
                const [customerResponse, minedResponse, ordersResponse, invoicesResponse] = await Promise.all([
                    api.get(`/customers/${customerId}`),
                    api.get(`/customers/${customerId}/mined-items`),
                    api.get(`/customers/${customerId}/orders`),
                    api.get(`/customers/${customerId}/invoices`),
                ]);

                setCustomer(customerResponse.data.data);
                setMinedItems(minedResponse.data.data || []);
                setOrders(ordersResponse.data.data || []);
                setInvoices(invoicesResponse.data.data || []);
            } catch (exception) {
                setError(exception.response?.data?.message || 'Customer could not be loaded.');
            }
        }

        loadCustomer();
    }, [customerId]);

    if (!customer) {
        return (
            <div className="space-y-4">
                <Button type="button" variant="ghost" onClick={() => window.location.assign('/customers')}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <p className="text-sm text-muted-foreground">{error || 'Loading customer...'}</p>
            </div>
        );
    }

    const unpaidInvoices = invoices.filter((invoice) => invoice.payment_status === 'Unpaid');

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="button" variant="ghost" onClick={() => window.location.assign('/customers')}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <Button type="button" variant="outline" onClick={() => window.location.assign(`/customers/${customer.id}/edit`)}>
                    <Edit className="h-4 w-4" />
                    Edit
                </Button>
            </div>

            {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

            <Card>
                <CardHeader>
                    <CardTitle>{customer.name}</CardTitle>
                    <CardDescription>{customer.facebook_name || 'No Facebook name saved'}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <Info label="Contact" value={customer.contact_number} />
                    <Info label="Facebook profile" value={customer.facebook_profile_url} link />
                    <Info label="Address" value={customer.address} />
                    <Info label="Notes" value={customer.notes} />
                </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard title="Mined items" value={minedItems.length} />
                <SummaryCard title="Orders" value={orders.length} />
                <SummaryCard title="Unpaid invoices" value={unpaidInvoices.length} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <ListCard title="Mined items" description="Active mined items for order creation.">
                    {minedItems.length ? minedItems.map((item) => (
                        <button key={item.id} type="button" onClick={() => window.location.assign(`/items/${item.id}`)} className="block w-full py-3 text-left text-sm hover:text-primary">
                            <span className="font-medium">{item.item_code}</span>
                            <span className="block text-muted-foreground">{item.item_name}</span>
                        </button>
                    )) : <EmptyText text="No active mined items." />}
                </ListCard>

                <ListCard title="Orders" description="Order history for this customer.">
                    {orders.length ? orders.map((order) => (
                        <div key={order.id} className="py-3 text-sm">
                            <div className="font-medium">{order.order_number}</div>
                            <div className="text-muted-foreground">{order.order_status} · PHP {Number(order.total_amount || 0).toFixed(2)}</div>
                        </div>
                    )) : <EmptyText text="No orders yet." />}
                </ListCard>

                <ListCard title="Invoices" description="Invoice and payment history.">
                    {invoices.length ? invoices.map((invoice) => (
                        <div key={invoice.id} className="py-3 text-sm">
                            <div className="font-medium">{invoice.invoice_number}</div>
                            <div className="text-muted-foreground">{invoice.payment_status} · PHP {Number(invoice.total_amount || 0).toFixed(2)}</div>
                        </div>
                    )) : <EmptyText text="No invoices yet." />}
                </ListCard>
            </div>
        </div>
    );
}

function Info({ label, value, link = false }) {
    return (
        <div>
            <div className="text-sm text-muted-foreground">{label}</div>
            {link && value ? (
                <a href={value} target="_blank" rel="noreferrer" className="mt-1 block text-sm text-primary hover:underline">{value}</a>
            ) : (
                <div className="mt-1 whitespace-pre-wrap text-sm">{value || '-'}</div>
            )}
        </div>
    );
}

function SummaryCard({ title, value }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>{title}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-semibold tracking-normal">{value}</div>
            </CardContent>
        </Card>
    );
}

function ListCard({ title, description, children }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">{children}</CardContent>
        </Card>
    );
}

function EmptyText({ text }) {
    return <p className="py-3 text-sm text-muted-foreground">{text}</p>;
}

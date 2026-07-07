import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/invoices')
            .then((response) => setInvoices(response.data.data || []))
            .catch((exception) => setError(exception.response?.data?.message || 'Invoices are not available yet.'));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-normal">Invoices</h2>
                <p className="text-sm text-muted-foreground">Generated customer invoices for sharing and payment tracking.</p>
            </div>
            {error ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</div> : null}
            <Card>
                <CardHeader>
                    <CardTitle>Invoice list</CardTitle>
                    <CardDescription>PDF and image invoices generated from orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-hidden rounded-lg border">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Invoice</th>
                                    <th className="px-4 py-3 font-medium">Customer</th>
                                    <th className="px-4 py-3 font-medium">Invoice status</th>
                                    <th className="px-4 py-3 font-medium">Payment</th>
                                    <th className="px-4 py-3 font-medium">Total</th>
                                    <th className="px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {invoices.length === 0 ? (
                                    <tr><td className="px-4 py-6 text-muted-foreground" colSpan="6">No invoices yet.</td></tr>
                                ) : invoices.map((invoice) => (
                                    <tr key={invoice.id}>
                                        <td className="px-4 py-3 font-medium">{invoice.invoice_number}</td>
                                        <td className="px-4 py-3">{invoice.customer?.name || '-'}</td>
                                        <td className="px-4 py-3">{invoice.invoice_status}</td>
                                        <td className="px-4 py-3">{invoice.payment_status}</td>
                                        <td className="px-4 py-3">PHP {Number(invoice.total_amount || 0).toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <Button type="button" variant="outline" size="sm" onClick={() => window.location.assign(`/invoices/${invoice.id}`)}>View</Button>
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

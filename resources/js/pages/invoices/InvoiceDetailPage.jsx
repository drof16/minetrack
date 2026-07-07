import { useEffect, useState } from 'react';
import { ArrowLeft, FileImage, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function InvoiceDetailPage({ invoiceId }) {
    const [invoice, setInvoice] = useState(null);
    const [methods, setMethods] = useState([]);
    const [payments, setPayments] = useState([]);
    const [payment, setPayment] = useState({ payment_method_id: '', amount: '', reference_number: '', payment_date: '', notes: '' });
    const [error, setError] = useState('');

    async function loadInvoice() {
        try {
            const [invoiceResponse, methodsResponse] = await Promise.all([
                api.get(`/invoices/${invoiceId}`),
                api.get('/payment-methods'),
            ]);
            setInvoice(invoiceResponse.data.data);
            setMethods(methodsResponse.data.data || []);
            setPayments(invoiceResponse.data.data.payments || []);
            setPayment((current) => ({ ...current, amount: invoiceResponse.data.data.total_amount || '' }));
        } catch (exception) {
            setError(exception.response?.data?.message || 'Invoice could not be loaded.');
        }
    }

    useEffect(() => {
        loadInvoice();
    }, [invoiceId]);

    async function markSent() {
        await api.patch(`/invoices/${invoiceId}/mark-sent`);
        await loadInvoice();
    }

    async function cancelInvoice() {
        await api.patch(`/invoices/${invoiceId}/cancel`);
        await loadInvoice();
    }

    async function recordPayment(event) {
        event.preventDefault();
        setError('');
        try {
            await api.post(`/invoices/${invoiceId}/payments`, {
                ...payment,
                payment_method_id: Number(payment.payment_method_id),
                amount: Number(payment.amount),
                payment_date: payment.payment_date || null,
            });
            await loadInvoice();
        } catch (exception) {
            const errors = exception.response?.data?.errors;
            setError(errors ? Object.values(errors).flat().join(' ') : exception.response?.data?.message || 'Payment could not be recorded.');
        }
    }

    async function uploadProof(paymentId, file) {
        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('proof', file);
        await api.post(`/payments/${paymentId}/upload-proof`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        await loadInvoice();
    }

    if (!invoice) {
        return <p className="text-sm text-muted-foreground">{error || 'Loading invoice...'}</p>;
    }

    return (
        <div className="space-y-6">
            <Button type="button" variant="ghost" onClick={() => window.location.assign('/invoices')}>
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>
            {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
            <Card>
                <CardHeader>
                    <CardTitle>{invoice.invoice_number}</CardTitle>
                    <CardDescription>{invoice.customer?.name || '-'} · {invoice.invoice_status} · {invoice.payment_status}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-4">
                        <Info label="Subtotal" value={`PHP ${Number(invoice.subtotal || 0).toFixed(2)}`} />
                        <Info label="Handling" value={`PHP ${Number(invoice.handling_fee || 0).toFixed(2)}`} />
                        <Info label="Delivery" value={`PHP ${Number(invoice.delivery_fee || 0).toFixed(2)}`} />
                        <Info label="Total" value={`PHP ${Number(invoice.total_amount || 0).toFixed(2)}`} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}>
                            <FileText className="h-4 w-4" />
                            View PDF
                        </Button>
                        <Button type="button" variant="outline" onClick={() => window.open(`/api/invoices/${invoice.id}/image`, '_blank')}>
                            <FileImage className="h-4 w-4" />
                            View image
                        </Button>
                        <Button type="button" onClick={markSent}>Mark sent</Button>
                        <Button type="button" variant="destructive" onClick={cancelInvoice}>Cancel</Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Record payment</CardTitle>
                    <CardDescription>Payment amount must equal invoice total. Partial payment is not allowed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={recordPayment}>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Payment method</Label>
                                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={payment.payment_method_id} onChange={(event) => setPayment((current) => ({ ...current, payment_method_id: event.target.value }))} required>
                                    <option value="">Select method</option>
                                    {methods.map((method) => <option key={method.id} value={method.id}>{method.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input type="number" min="0" step="0.01" value={payment.amount} onChange={(event) => setPayment((current) => ({ ...current, amount: event.target.value }))} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Payment date</Label>
                                <Input type="datetime-local" value={payment.payment_date} onChange={(event) => setPayment((current) => ({ ...current, payment_date: event.target.value }))} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Reference number</Label>
                            <Input value={payment.reference_number} onChange={(event) => setPayment((current) => ({ ...current, reference_number: event.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea value={payment.notes} onChange={(event) => setPayment((current) => ({ ...current, notes: event.target.value }))} />
                        </div>
                        <Button type="submit" disabled={invoice.payment_status === 'Paid'}>Mark paid</Button>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Payment history</CardTitle>
                    <CardDescription>Upload proof of payment after a payment is recorded.</CardDescription>
                </CardHeader>
                <CardContent className="divide-y">
                    {payments.length === 0 ? <p className="text-sm text-muted-foreground">No payments yet.</p> : payments.map((record) => (
                        <div key={record.id} className="flex flex-col gap-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="font-medium">{record.payment_method?.name || 'Payment'} · PHP {Number(record.amount || 0).toFixed(2)}</div>
                                <div className="text-muted-foreground">{record.reference_number || 'No reference'}</div>
                                {record.proof_image_url ? <a href={record.proof_image_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">View proof</a> : null}
                            </div>
                            <label className="inline-flex">
                                <input type="file" accept="image/*" className="sr-only" onChange={(event) => uploadProof(record.id, event.target.files?.[0])} />
                                <span className="inline-flex h-10 cursor-pointer items-center rounded-md border border-input px-4 text-sm font-medium hover:bg-accent">Upload proof</span>
                            </label>
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

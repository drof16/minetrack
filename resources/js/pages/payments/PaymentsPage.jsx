import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        api.get('/payments').then((response) => setPayments(response.data.data || [])).catch(() => setPayments([]));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-normal">Payments</h2>
                <p className="text-sm text-muted-foreground">Payment history for paid invoices.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Payment history</CardTitle>
                    <CardDescription>Recorded full payments only.</CardDescription>
                </CardHeader>
                <CardContent className="divide-y">
                    {payments.length === 0 ? <p className="text-sm text-muted-foreground">No payments yet.</p> : payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between py-3 text-sm">
                            <div>
                                <div className="font-medium">{payment.payment_method?.name || 'Payment'}</div>
                                <div className="text-muted-foreground">{payment.reference_number || 'No reference'}</div>
                            </div>
                            <div>PHP {Number(payment.amount || 0).toFixed(2)}</div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

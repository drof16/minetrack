import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CreateOrderPage() {
    const [customers, setCustomers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [minedItems, setMinedItems] = useState([]);
    const [form, setForm] = useState({
        customer_id: '',
        item_ids: [],
        handling_fee: '0',
        delivery_fee: '0',
        discount: '0',
        pickup_or_delivery_method: '',
        location_id: '',
        notes: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        Promise.all([api.get('/customers', { params: { per_page: 100 } }), api.get('/locations')])
            .then(([customersResponse, locationsResponse]) => {
                setCustomers(customersResponse.data.data || []);
                setLocations(locationsResponse.data.data || []);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!form.customer_id) {
            setMinedItems([]);
            return;
        }

        api.get(`/customers/${form.customer_id}/active-mined-items`)
            .then((response) => setMinedItems(response.data.data || []))
            .catch(() => setMinedItems([]));
    }, [form.customer_id]);

    const subtotal = useMemo(() => {
        return minedItems
            .filter((item) => form.item_ids.includes(item.id))
            .reduce((total, item) => total + Number(item.selling_price || 0), 0);
    }, [minedItems, form.item_ids]);

    const total = Math.max(0, subtotal + Number(form.handling_fee || 0) + Number(form.delivery_fee || 0) - Number(form.discount || 0));

    function updateField(key, value) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    function toggleItem(itemId) {
        setForm((current) => ({
            ...current,
            item_ids: current.item_ids.includes(itemId)
                ? current.item_ids.filter((id) => id !== itemId)
                : [...current.item_ids, itemId],
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await api.post('/orders', {
                ...form,
                customer_id: Number(form.customer_id),
                handling_fee: Number(form.handling_fee || 0),
                delivery_fee: Number(form.delivery_fee || 0),
                discount: Number(form.discount || 0),
                location_id: form.location_id ? Number(form.location_id) : null,
            });
            window.location.assign(`/orders/${response.data.data.id}`);
        } catch (exception) {
            const errors = exception.response?.data?.errors;
            setError(errors ? Object.values(errors).flat().join(' ') : exception.response?.data?.message || 'Order could not be created.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-5xl space-y-6">
            <Button type="button" variant="ghost" onClick={() => window.location.assign('/orders')}>
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Create order</CardTitle>
                    <CardDescription>Select a customer and active mined items to group into one order.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
                        <div className="space-y-2">
                            <Label>Customer</Label>
                            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.customer_id} onChange={(event) => updateField('customer_id', event.target.value)} required>
                                <option value="">Select customer</option>
                                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <Label>Active mined items</Label>
                            {minedItems.length === 0 ? <p className="text-sm text-muted-foreground">No active mined items for this customer.</p> : minedItems.map((item) => (
                                <label key={item.id} className="flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm">
                                    <span>
                                        <span className="font-medium">{item.item_code}</span>
                                        <span className="block text-muted-foreground">{item.item_name}</span>
                                    </span>
                                    <span className="flex items-center gap-3">
                                        PHP {Number(item.selling_price || 0).toFixed(2)}
                                        <input type="checkbox" checked={form.item_ids.includes(item.id)} onChange={() => toggleItem(item.id)} />
                                    </span>
                                </label>
                            ))}
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Field label="Handling fee" value={form.handling_fee} onChange={(value) => updateField('handling_fee', value)} />
                            <Field label="Delivery fee" value={form.delivery_fee} onChange={(value) => updateField('delivery_fee', value)} />
                            <Field label="Discount" value={form.discount} onChange={(value) => updateField('discount', value)} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Pickup / delivery method</Label>
                                <Input value={form.pickup_or_delivery_method} onChange={(event) => updateField('pickup_or_delivery_method', event.target.value)} placeholder="Pickup, delivery, drop-off" />
                            </div>
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.location_id} onChange={(event) => updateField('location_id', event.target.value)}>
                                    <option value="">Select location</option>
                                    {locations.map((location) => <option key={location.id} value={location.id}>{location.location_name} ({location.location_type})</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
                        </div>
                        <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                            <div>Subtotal: PHP {subtotal.toFixed(2)}</div>
                            <div>Total: <span className="font-semibold">PHP {total.toFixed(2)}</span></div>
                        </div>
                        <Button type="submit" disabled={isSubmitting || form.item_ids.length === 0}>
                            <Save className="h-4 w-4" />
                            {isSubmitting ? 'Creating...' : 'Create order'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function Field({ label, value, onChange }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input type="number" min="0" step="0.01" value={value} onChange={(event) => onChange(event.target.value)} />
        </div>
    );
}

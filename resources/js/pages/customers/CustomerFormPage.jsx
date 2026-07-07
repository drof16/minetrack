import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const defaultForm = {
    name: '',
    facebook_name: '',
    facebook_profile_url: '',
    contact_number: '',
    address: '',
    notes: '',
};

export default function CustomerFormPage({ customerId }) {
    const isEditing = Boolean(customerId);
    const [form, setForm] = useState(defaultForm);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isEditing) {
            return;
        }

        api.get(`/customers/${customerId}`)
            .then((response) => {
                const customer = response.data.data;
                setForm({
                    name: customer.name || '',
                    facebook_name: customer.facebook_name || '',
                    facebook_profile_url: customer.facebook_profile_url || '',
                    contact_number: customer.contact_number || '',
                    address: customer.address || '',
                    notes: customer.notes || '',
                });
            })
            .catch((exception) => setError(exception.response?.data?.message || 'Customer could not be loaded.'));
    }, [isEditing, customerId]);

    function updateField(key, value) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = isEditing
                ? await api.put(`/customers/${customerId}`, form)
                : await api.post('/customers', form);

            window.location.assign(`/customers/${response.data.data.id}`);
        } catch (exception) {
            setError(exception.response?.data?.message || 'Customer could not be saved.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-3xl space-y-6">
            <Button type="button" variant="ghost" onClick={() => window.location.assign('/customers')}>
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>{isEditing ? 'Edit customer' : 'Add customer'}</CardTitle>
                    <CardDescription>Customer profile for miner history, orders, and invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="facebook_name">Facebook name</Label>
                                <Input id="facebook_name" value={form.facebook_name} onChange={(event) => updateField('facebook_name', event.target.value)} />
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="contact_number">Contact number</Label>
                                <Input id="contact_number" value={form.contact_number} onChange={(event) => updateField('contact_number', event.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="facebook_profile_url">Facebook profile URL</Label>
                                <Input id="facebook_profile_url" type="url" value={form.facebook_profile_url} onChange={(event) => updateField('facebook_profile_url', event.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea id="address" value={form.address} onChange={(event) => updateField('address', event.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                <Save className="h-4 w-4" />
                                {isSubmitting ? 'Saving...' : 'Save customer'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

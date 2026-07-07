import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const defaultForm = {
    customer_id: '',
    mine_text: 'Mine',
    facebook_comment_url: '',
    mine_time: '',
    source: 'manual',
    notes: '',
};

const sources = ['manual', 'facebook_page', 'facebook_profile', 'facebook_group', 'facebook_marketplace', 'other'];

export default function MineForm({ itemId, mode = 'active', onSaved }) {
    const [customers, setCustomers] = useState([]);
    const [form, setForm] = useState(defaultForm);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        api.get('/customers', { params: { per_page: 100 } })
            .then((response) => setCustomers(response.data.data || []))
            .catch(() => setCustomers([]));
    }, []);

    function updateField(key, value) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const endpoint = mode === 'backup' ? `/items/${itemId}/backup-mines` : `/items/${itemId}/mines`;
            await api.post(endpoint, {
                ...form,
                customer_id: Number(form.customer_id),
                mine_time: form.mine_time || null,
            });
            setForm(defaultForm);
            onSaved?.();
        } catch (exception) {
            const errors = exception.response?.data?.errors;
            setError(errors ? Object.values(errors).flat().join(' ') : exception.response?.data?.message || 'Mine could not be saved.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="space-y-3" onSubmit={handleSubmit}>
            {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
            <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Customer</Label>
                    <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.customer_id} onChange={(event) => updateField('customer_id', event.target.value)} required>
                        <option value="">Select customer</option>
                        {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label>Source</Label>
                    <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.source} onChange={(event) => updateField('source', event.target.value)}>
                        {sources.map((source) => <option key={source} value={source}>{source}</option>)}
                    </select>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Mine text</Label>
                <Textarea value={form.mine_text} onChange={(event) => updateField('mine_text', event.target.value)} required />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Comment URL</Label>
                    <Input type="url" value={form.facebook_comment_url} onChange={(event) => updateField('facebook_comment_url', event.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Mine time</Label>
                    <Input type="datetime-local" value={form.mine_time} onChange={(event) => updateField('mine_time', event.target.value)} />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : mode === 'backup' ? 'Add backup miner' : 'Record first miner'}
            </Button>
        </form>
    );
}

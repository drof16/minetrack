import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const defaultForm = {
    item_code: '',
    category_id: '',
    item_name: '',
    description: '',
    condition: '',
    selling_price: '',
    facebook_post_url: '',
    facebook_post_id: '',
    status: 'Available',
};

const statuses = ['Available', 'Mined', 'Confirmed', 'For Packing', 'Packed', 'For Pickup', 'For Delivery', 'Picked Up', 'Delivered', 'Sold', 'Cancelled', 'Unclaimed', 'Returned', 'Unavailable'];

export default function ItemFormPage({ itemId }) {
    const isEditing = Boolean(itemId);
    const [form, setForm] = useState(defaultForm);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        api.get('/categories')
            .then((response) => setCategories(response.data.data || []))
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        if (!isEditing) {
            return;
        }

        api.get(`/items/${itemId}`)
            .then((response) => {
                const item = response.data.data;
                setForm({
                    item_code: item.item_code || '',
                    category_id: item.category_id || '',
                    item_name: item.item_name || '',
                    description: item.description || '',
                    condition: item.condition || '',
                    selling_price: item.selling_price || '',
                    facebook_post_url: item.facebook_post_url || '',
                    facebook_post_id: item.facebook_post_id || '',
                    status: item.status || 'Available',
                });
            })
            .catch((exception) => setError(exception.response?.data?.message || 'Item could not be loaded.'));
    }, [isEditing, itemId]);

    function updateField(key, value) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const payload = {
                ...form,
                category_id: Number(form.category_id),
                selling_price: Number(form.selling_price),
            };

            const response = isEditing
                ? await api.put(`/items/${itemId}`, payload)
                : await api.post('/items', payload);

            window.location.assign(`/items/${response.data.data.id}`);
        } catch (exception) {
            setError(exception.response?.data?.message || 'Item could not be saved.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-3xl space-y-6">
            <Button type="button" variant="ghost" onClick={() => window.location.assign('/items')}>
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>{isEditing ? 'Edit item' : 'Add item'}</CardTitle>
                    <CardDescription>Track the selling details and Facebook post link for a manual-first item.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="item_code">Item code</Label>
                                <Input id="item_code" value={form.item_code} onChange={(event) => updateField('item_code', event.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category_id">Category</Label>
                                <select id="category_id" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.category_id} onChange={(event) => updateField('category_id', event.target.value)} required>
                                    <option value="">Select category</option>
                                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="item_name">Item name</Label>
                            <Input id="item_name" value={form.item_name} onChange={(event) => updateField('item_name', event.target.value)} required />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="condition">Condition</Label>
                                <Input id="condition" value={form.condition} onChange={(event) => updateField('condition', event.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="selling_price">Selling price</Label>
                                <Input id="selling_price" type="number" min="0" step="0.01" value={form.selling_price} onChange={(event) => updateField('selling_price', event.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select id="status" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(event) => updateField('status', event.target.value)}>
                                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="facebook_post_url">Facebook post link</Label>
                            <Input id="facebook_post_url" type="url" value={form.facebook_post_url} onChange={(event) => updateField('facebook_post_url', event.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="facebook_post_id">Facebook post ID</Label>
                            <Input id="facebook_post_id" value={form.facebook_post_id} onChange={(event) => updateField('facebook_post_id', event.target.value)} placeholder="Optional, useful when URL parsing fails" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={form.description} onChange={(event) => updateField('description', event.target.value)} />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                <Save className="h-4 w-4" />
                                {isSubmitting ? 'Saving...' : 'Save item'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

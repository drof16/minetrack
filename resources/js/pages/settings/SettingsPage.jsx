import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function SettingsPage() {
    const [settings, setSettings] = useState({});
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [methods, setMethods] = useState([]);
    const [categoryForm, setCategoryForm] = useState({ name: '', code: '' });
    const [locationForm, setLocationForm] = useState({ location_name: '', location_type: 'pickup', fee: '0', is_active: true });
    const [methodForm, setMethodForm] = useState({ name: '', is_active: true });
    const [error, setError] = useState('');

    async function load() {
        const [settingsRes, categoriesRes, locationsRes, methodsRes] = await Promise.all([
            api.get('/settings'),
            api.get('/categories'),
            api.get('/locations'),
            api.get('/payment-methods'),
        ]);
        setSettings(settingsRes.data.data || {});
        setCategories(categoriesRes.data.data || []);
        setLocations(locationsRes.data.data || []);
        setMethods(methodsRes.data.data || []);
    }

    useEffect(() => {
        load().catch(() => {});
    }, []);

    function update(key, value) {
        setSettings((current) => ({ ...current, [key]: value }));
    }

    async function saveSettings(event) {
        event.preventDefault();
        setError('');
        try {
            await api.put('/settings', settings);
            await load();
        } catch (exception) {
            setError(exception.response?.data?.message || 'Settings could not be saved.');
        }
    }

    async function saveCategory(event) {
        event.preventDefault();
        await api.post('/categories', categoryForm);
        setCategoryForm({ name: '', code: '' });
        await load();
    }

    async function saveLocation(event) {
        event.preventDefault();
        await api.post('/locations', { ...locationForm, fee: Number(locationForm.fee || 0) });
        setLocationForm({ location_name: '', location_type: 'pickup', fee: '0', is_active: true });
        await load();
    }

    async function saveMethod(event) {
        event.preventDefault();
        await api.post('/payment-methods', methodForm);
        setMethodForm({ name: '', is_active: true });
        await load();
    }

    async function remove(path) {
        await api.delete(path);
        await load();
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-normal">Settings</h2>
                <p className="text-sm text-muted-foreground">Business defaults for invoices, reservations, locations, methods, and categories.</p>
            </div>
            {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
            <Card>
                <CardHeader>
                    <CardTitle>Shop details</CardTitle>
                    <CardDescription>Core invoice and reservation settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={saveSettings}>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Field label="Shop name" value={settings.shop_name || ''} onChange={(value) => update('shop_name', value)} />
                            <Field label="Default handling fee" type="number" value={settings.default_handling_fee || '0'} onChange={(value) => update('default_handling_fee', value)} />
                            <div className="space-y-2">
                                <Label>Reservation duration</Label>
                                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={settings.reservation_duration || 'no_limit'} onChange={(event) => update('reservation_duration', event.target.value)}>
                                    {['no_limit', '24_hours', '48_hours', '3_days', 'until_next_dropoff'].map((value) => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Invoice footer note</Label>
                            <Textarea value={settings.invoice_footer_note || ''} onChange={(event) => update('invoice_footer_note', event.target.value)} />
                        </div>
                        <Button type="submit">Save settings</Button>
                    </form>
                </CardContent>
            </Card>
            <div className="grid gap-4 xl:grid-cols-3">
                <CrudCard title="Categories" onSubmit={saveCategory}>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <Input placeholder="Name" value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))} required />
                        <Input placeholder="Code" value={categoryForm.code} onChange={(event) => setCategoryForm((current) => ({ ...current, code: event.target.value }))} required />
                    </div>
                    <Button type="submit">Add category</Button>
                    <RecordList records={categories} render={(category) => `${category.name} / ${category.code}`} onDelete={(category) => remove(`/categories/${category.id}`)} />
                </CrudCard>
                <CrudCard title="Locations" onSubmit={saveLocation}>
                    <Input placeholder="Location name" value={locationForm.location_name} onChange={(event) => setLocationForm((current) => ({ ...current, location_name: event.target.value }))} required />
                    <div className="grid gap-2 sm:grid-cols-2">
                        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={locationForm.location_type} onChange={(event) => setLocationForm((current) => ({ ...current, location_type: event.target.value }))}>
                            {['pickup', 'dropoff', 'delivery_area'].map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <Input type="number" min="0" step="0.01" value={locationForm.fee} onChange={(event) => setLocationForm((current) => ({ ...current, fee: event.target.value }))} />
                    </div>
                    <Button type="submit">Add location</Button>
                    <RecordList records={locations} render={(location) => `${location.location_name} / ${location.location_type} / PHP ${Number(location.fee || 0).toFixed(2)}`} onDelete={(location) => remove(`/locations/${location.id}`)} />
                </CrudCard>
                <CrudCard title="Payment methods" onSubmit={saveMethod}>
                    <Input placeholder="Method name" value={methodForm.name} onChange={(event) => setMethodForm((current) => ({ ...current, name: event.target.value }))} required />
                    <Button type="submit">Add method</Button>
                    <RecordList records={methods} render={(method) => `${method.name}${method.is_active ? '' : ' (inactive)'}`} onDelete={(method) => remove(`/payment-methods/${method.id}`)} />
                </CrudCard>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, type = 'text' }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
        </div>
    );
}

function CrudCard({ title, onSubmit, children }) {
    return (
        <Card>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent>
                <form className="space-y-3" onSubmit={onSubmit}>{children}</form>
            </CardContent>
        </Card>
    );
}

function RecordList({ records, render, onDelete }) {
    return (
        <div className="space-y-2 pt-2">
            {records.length ? records.map((record) => (
                <div key={record.id} className="flex items-center justify-between gap-3 rounded-md border p-2 text-sm">
                    <span>{render(record)}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(record)} aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )) : <p className="text-sm text-muted-foreground">No records.</p>}
        </div>
    );
}

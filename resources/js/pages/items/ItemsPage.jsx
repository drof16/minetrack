import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { api } from '@/lib/api';
import ItemStatusBadge from '@/components/items/ItemStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ItemsPage() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({ search: '', category_id: '', status: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get('/categories')
            .then((response) => setCategories(response.data.data || []))
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        async function loadItems() {
            setIsLoading(true);
            setError('');

            try {
                const response = await api.get('/items', { params: filters });
                setItems(response.data.data || []);
            } catch (exception) {
                setError(exception.response?.data?.message || 'Items are not available yet.');
            } finally {
                setIsLoading(false);
            }
        }

        loadItems();
    }, [filters]);

    function updateFilter(key, value) {
        setFilters((current) => ({ ...current, [key]: value }));
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-normal">Items</h2>
                    <p className="text-sm text-muted-foreground">Manual-first inventory tracking with Facebook post links.</p>
                </div>
                <Button type="button" onClick={() => window.location.assign('/items/new')}>
                    <Plus className="h-4 w-4" />
                    Add item
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>Search and filter items by category or status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
                        <label className="relative block">
                            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder="Search item code, name, or description"
                                value={filters.search}
                                onChange={(event) => updateFilter('search', event.target.value)}
                            />
                        </label>
                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            value={filters.category_id}
                            onChange={(event) => updateFilter('category_id', event.target.value)}
                        >
                            <option value="">All categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            value={filters.status}
                            onChange={(event) => updateFilter('status', event.target.value)}
                        >
                            <option value="">All statuses</option>
                            {['Available', 'Mined', 'Confirmed', 'For Packing', 'Packed', 'For Pickup', 'For Delivery', 'Sold', 'Cancelled'].map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    {error ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</div> : null}

                    <div className="overflow-hidden rounded-lg border">
                        <table className="w-full min-w-[820px] text-left text-sm">
                            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Photo</th>
                                    <th className="px-4 py-3 font-medium">Code</th>
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Category</th>
                                    <th className="px-4 py-3 font-medium">Price</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Facebook post</th>
                                    <th className="px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading ? (
                                    <tr>
                                        <td className="px-4 py-6 text-muted-foreground" colSpan="8">Loading items...</td>
                                    </tr>
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td className="px-4 py-6 text-muted-foreground" colSpan="8">No items found.</td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">
                                                <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                                                    {item.photo_url ? <img src={item.photo_url} alt="" className="h-full w-full object-cover" /> : null}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-medium">{item.item_code}</td>
                                            <td className="px-4 py-3">{item.item_name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{item.category?.name || '-'}</td>
                                            <td className="px-4 py-3">PHP {Number(item.selling_price || 0).toFixed(2)}</td>
                                            <td className="px-4 py-3"><ItemStatusBadge status={item.status} /></td>
                                            <td className="px-4 py-3">
                                                {item.facebook_post_url ? (
                                                    <a className="text-primary hover:underline" href={item.facebook_post_url} target="_blank" rel="noreferrer">Open</a>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button type="button" variant="outline" size="sm" onClick={() => window.location.assign(`/items/${item.id}`)}>
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

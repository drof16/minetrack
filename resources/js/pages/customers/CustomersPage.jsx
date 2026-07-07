import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadCustomers() {
            setIsLoading(true);
            setError('');

            try {
                const response = await api.get('/customers', { params: { search } });
                setCustomers(response.data.data || []);
            } catch (exception) {
                setError(exception.response?.data?.message || 'Customers are not available yet.');
            } finally {
                setIsLoading(false);
            }
        }

        loadCustomers();
    }, [search]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-normal">Customers</h2>
                    <p className="text-sm text-muted-foreground">Customer records for miners, orders, and invoices.</p>
                </div>
                <Button type="button" onClick={() => window.location.assign('/customers/new')}>
                    <Plus className="h-4 w-4" />
                    Add customer
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Customer directory</CardTitle>
                    <CardDescription>Search by name, Facebook name, or contact number.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <label className="relative block max-w-xl">
                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" placeholder="Search customers" value={search} onChange={(event) => setSearch(event.target.value)} />
                    </label>
                    {error ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</div> : null}
                    <div className="overflow-hidden rounded-lg border">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Facebook</th>
                                    <th className="px-4 py-3 font-medium">Contact</th>
                                    <th className="px-4 py-3 font-medium">Mines</th>
                                    <th className="px-4 py-3 font-medium">Orders</th>
                                    <th className="px-4 py-3 font-medium">Invoices</th>
                                    <th className="px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading ? (
                                    <tr><td className="px-4 py-6 text-muted-foreground" colSpan="7">Loading customers...</td></tr>
                                ) : customers.length === 0 ? (
                                    <tr><td className="px-4 py-6 text-muted-foreground" colSpan="7">No customers found.</td></tr>
                                ) : customers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td className="px-4 py-3 font-medium">{customer.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{customer.facebook_name || '-'}</td>
                                        <td className="px-4 py-3">{customer.contact_number || '-'}</td>
                                        <td className="px-4 py-3">{customer.mines_count ?? 0}</td>
                                        <td className="px-4 py-3">{customer.orders_count ?? 0}</td>
                                        <td className="px-4 py-3">{customer.invoices_count ?? 0}</td>
                                        <td className="px-4 py-3">
                                            <Button type="button" variant="outline" size="sm" onClick={() => window.location.assign(`/customers/${customer.id}`)}>
                                                View
                                            </Button>
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

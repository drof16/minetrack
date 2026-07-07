import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, FileText, PackageCheck, Play, RefreshCw, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const exampleText = `ITM-001 - Maria Santos - mine
Juan Dela Cruz mine ITM-002
ITM-003 Ana Reyes mine backup`;

export default function QuickImportPage() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({
        mine_texts: '',
        default_item_id: '',
        create_missing_customers: true,
        create_orders: false,
        generate_invoices: false,
    });
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        api.get('/items', { params: { per_page: 500 } })
            .then((response) => setItems(response.data.data || []))
            .catch(() => setItems([]));
    }, []);

    const rows = preview?.rows || [];
    const readyRows = rows.filter((row) => row.can_process);
    const needsAttentionRows = rows.filter((row) => !row.can_process);
    const canProcess = readyRows.length > 0 && !isProcessing;

    const previewSummary = useMemo(() => preview?.summary || {
        total_lines: 0,
        ready: 0,
        needs_attention: 0,
        active_mines: 0,
        backup_mines: 0,
    }, [preview]);

    function updateField(key, value) {
        setForm((current) => {
            const next = { ...current, [key]: value };
            if (key === 'create_orders' && !value) {
                next.generate_invoices = false;
            }
            if (key === 'generate_invoices' && value) {
                next.create_orders = true;
            }
            return next;
        });
        setResult(null);
    }

    async function handlePreview(event) {
        event.preventDefault();
        setError('');
        setResult(null);
        setIsPreviewing(true);

        try {
            const response = await api.post('/bulk-mines/preview', payload());
            setPreview(response.data.data);
        } catch (exception) {
            setError(readError(exception, 'Bulk import preview could not be created.'));
        } finally {
            setIsPreviewing(false);
        }
    }

    async function handleProcess() {
        setError('');
        setIsProcessing(true);

        try {
            const response = await api.post('/bulk-mines/process', payload());
            setResult(response.data.data);
            const refreshed = await api.post('/bulk-mines/preview', payload());
            setPreview(refreshed.data.data);
        } catch (exception) {
            setError(readError(exception, 'Bulk import could not be processed.'));
        } finally {
            setIsProcessing(false);
        }
    }

    function payload() {
        return {
            ...form,
            default_item_id: form.default_item_id ? Number(form.default_item_id) : null,
        };
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-normal">Quick Import</h2>
                    <p className="text-sm text-muted-foreground">Paste mine comments, preview matches, then create miners, customers, orders, and invoices in one flow.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                    <SummaryPill label="Ready" value={previewSummary.ready} />
                    <SummaryPill label="Needs attention" value={previewSummary.needs_attention} />
                    <SummaryPill label="Active" value={previewSummary.active_mines} />
                    <SummaryPill label="Backup" value={previewSummary.backup_mines} />
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            Paste mine comments
                        </CardTitle>
                        <CardDescription>Use item codes in each line, or select one default item for all pasted lines.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-5" onSubmit={handlePreview}>
                            {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

                            <div className="space-y-2">
                                <Label>Default item</Label>
                                <select
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    value={form.default_item_id}
                                    onChange={(event) => updateField('default_item_id', event.target.value)}
                                >
                                    <option value="">Detect item code from each line</option>
                                    {items.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.item_code} - {item.item_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <Label>Mine comments</Label>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => updateField('mine_texts', exampleText)}>
                                        Use sample
                                    </Button>
                                </div>
                                <Textarea
                                    className="min-h-56 font-mono text-sm"
                                    value={form.mine_texts}
                                    onChange={(event) => updateField('mine_texts', event.target.value)}
                                    placeholder="Paste one mine comment per line"
                                    required
                                />
                            </div>

                            <div className="grid gap-3">
                                <ToggleRow
                                    checked={form.create_missing_customers}
                                    title="Create missing customers"
                                    description="If a name is not found, create a basic customer profile automatically."
                                    onChange={(checked) => updateField('create_missing_customers', checked)}
                                />
                                <ToggleRow
                                    checked={form.create_orders}
                                    title="Create orders for active mines"
                                    description="Group newly active mined items by customer after import."
                                    onChange={(checked) => updateField('create_orders', checked)}
                                />
                                <ToggleRow
                                    checked={form.generate_invoices}
                                    title="Generate invoices too"
                                    description="Create invoices immediately for auto-created orders."
                                    onChange={(checked) => updateField('generate_invoices', checked)}
                                />
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button type="submit" disabled={isPreviewing}>
                                    <RefreshCw className="h-4 w-4" />
                                    {isPreviewing ? 'Previewing...' : 'Preview import'}
                                </Button>
                                <Button type="button" variant="outline" disabled={!canProcess} onClick={handleProcess}>
                                    <Play className="h-4 w-4" />
                                    {isProcessing ? 'Processing...' : `Process ${readyRows.length} ready line${readyRows.length === 1 ? '' : 's'}`}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardCheck className="h-5 w-5" />
                                Preview
                            </CardTitle>
                            <CardDescription>Review what MineTrack will create before touching the database.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!preview ? (
                                <EmptyState text="Paste comments and click Preview import." />
                            ) : rows.length === 0 ? (
                                <EmptyState text="No usable lines found." />
                            ) : (
                                <div className="space-y-3">
                                    {needsAttentionRows.length ? (
                                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                            {needsAttentionRows.length} line{needsAttentionRows.length === 1 ? '' : 's'} need attention before they can be processed.
                                        </div>
                                    ) : null}
                                    <div className="overflow-hidden rounded-lg border">
                                        <table className="w-full min-w-[820px] text-left text-sm">
                                            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Line</th>
                                                    <th className="px-4 py-3 font-medium">Item</th>
                                                    <th className="px-4 py-3 font-medium">Customer</th>
                                                    <th className="px-4 py-3 font-medium">Action</th>
                                                    <th className="px-4 py-3 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {rows.map((row) => <PreviewRow key={`${row.line_number}-${row.raw_text}`} row={row} />)}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {result ? <ResultPanel result={result} /> : null}
                </div>
            </div>
        </div>
    );
}

function SummaryPill({ label, value }) {
    return (
        <div className="rounded-md border bg-card px-3 py-2">
            <div className="text-lg font-semibold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
        </div>
    );
}

function ToggleRow({ checked, title, description, onChange }) {
    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3">
            <input
                type="checkbox"
                className="mt-1"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
            />
            <span>
                <span className="block text-sm font-medium">{title}</span>
                <span className="block text-sm text-muted-foreground">{description}</span>
            </span>
        </label>
    );
}

function PreviewRow({ row }) {
    const badgeClass = row.can_process ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800';

    return (
        <tr>
            <td className="px-4 py-3">
                <div className="font-medium">#{row.line_number}</div>
                <div className="max-w-xs truncate text-muted-foreground">{row.raw_text}</div>
                {row.messages?.length ? (
                    <div className="mt-1 text-xs text-amber-700">{row.messages.join(' ')}</div>
                ) : null}
            </td>
            <td className="px-4 py-3">
                {row.item ? (
                    <>
                        <div className="font-medium">{row.item.item_code}</div>
                        <div className="text-muted-foreground">{row.item.item_name}</div>
                    </>
                ) : <span className="text-muted-foreground">No match</span>}
            </td>
            <td className="px-4 py-3">
                <div className="font-medium">{row.customer?.name || 'No name'}</div>
                <div className="text-muted-foreground">{row.customer?.matched ? 'Existing customer' : 'New customer'}</div>
            </td>
            <td className="px-4 py-3">
                {row.action ? <span className="capitalize">{row.action} miner</span> : <span className="text-muted-foreground">-</span>}
            </td>
            <td className="px-4 py-3">
                <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${badgeClass}`}>
                    {row.can_process ? 'Ready' : 'Needs attention'}
                </span>
            </td>
        </tr>
    );
}

function ResultPanel({ result }) {
    const createdRows = result.rows?.filter((row) => row.status === 'created') || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PackageCheck className="h-5 w-5" />
                    Import complete
                </CardTitle>
                <CardDescription>{createdRows.length} mine record{createdRows.length === 1 ? '' : 's'} created.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
                <ResultList title="Customers" items={result.created_customers || []} render={(customer) => customer.name} />
                <ResultList title="Orders" items={result.created_orders || []} render={(order) => (
                    <button type="button" className="text-primary hover:underline" onClick={() => window.location.assign(`/orders/${order.id}`)}>
                        {order.order_number}
                    </button>
                )} />
                <ResultList title="Invoices" items={result.created_invoices || []} render={(invoice) => (
                    <button type="button" className="inline-flex items-center gap-1 text-primary hover:underline" onClick={() => window.location.assign(`/invoices/${invoice.id}`)}>
                        <FileText className="h-3 w-3" />
                        {invoice.invoice_number}
                    </button>
                )} />
            </CardContent>
        </Card>
    );
}

function ResultList({ title, items, render }) {
    return (
        <div className="rounded-md border p-3">
            <div className="text-sm font-medium">{title}</div>
            {items.length ? (
                <div className="mt-2 space-y-1 text-sm">{items.map((item) => <div key={item.id}>{render(item)}</div>)}</div>
            ) : (
                <div className="mt-2 text-sm text-muted-foreground">None</div>
            )}
        </div>
    );
}

function EmptyState({ text }) {
    return <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">{text}</div>;
}

function readError(exception, fallback) {
    const errors = exception.response?.data?.errors;
    return errors ? Object.values(errors).flat().join(' ') : exception.response?.data?.message || fallback;
}

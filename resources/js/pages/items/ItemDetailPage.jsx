import { useEffect, useState } from 'react';
import { ArrowLeft, Edit, RefreshCw, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import MineForm from '@/components/items/MineForm';
import ItemStatusBadge from '@/components/items/ItemStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const statuses = ['Available', 'Mined', 'Confirmed', 'For Packing', 'Packed', 'For Pickup', 'For Delivery', 'Picked Up', 'Delivered', 'Sold', 'Cancelled', 'Unclaimed', 'Returned', 'Unavailable'];

export default function ItemDetailPage({ itemId }) {
    const [item, setItem] = useState(null);
    const [statusLogs, setStatusLogs] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [error, setError] = useState('');
    const [mineFormMode, setMineFormMode] = useState('');
    const [confirmMove, setConfirmMove] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    async function loadItem() {
        try {
            const [itemResponse, logsResponse] = await Promise.all([
                api.get(`/items/${itemId}`),
                api.get(`/items/${itemId}/status-logs`),
            ]);
            setItem(itemResponse.data.data);
            setSelectedStatus(itemResponse.data.data.status);
            setStatusLogs(logsResponse.data.data || []);
        } catch (exception) {
            setError(exception.response?.data?.message || 'Item could not be loaded.');
        }
    }

    useEffect(() => {
        loadItem();
    }, [itemId]);

    async function uploadPhoto(event) {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('photo', file);

        try {
            const response = await api.post(`/items/${itemId}/upload-photo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setItem(response.data.data);
        } catch (exception) {
            setError(exception.response?.data?.message || 'Photo could not be uploaded.');
        }
    }

    async function updateStatus() {
        try {
            const response = await api.patch(`/items/${itemId}/status`, { status: selectedStatus });
            setItem(response.data.data);
            await loadItem();
        } catch (exception) {
            setError(exception.response?.data?.message || 'Status could not be changed.');
        }
    }

    async function cancelMine(mine) {
        try {
            await api.patch(`/mines/${mine.id}/cancel`, { notes: 'Cancelled by admin.' });
            await loadItem();
        } catch (exception) {
            setError(exception.response?.data?.message || 'Mine could not be cancelled.');
        }
    }

    async function moveToNextMiner() {
        try {
            await api.post(`/items/${itemId}/move-to-next-miner`, { confirm: true });
            setConfirmMove(false);
            await loadItem();
        } catch (exception) {
            const errors = exception.response?.data?.errors;
            setError(errors ? Object.values(errors).flat().join(' ') : exception.response?.data?.message || 'Backup miner could not be moved.');
        }
    }

    async function syncFacebookComments() {
        setError('');
        setSyncResult(null);
        setIsSyncing(true);

        try {
            const response = await api.post(`/items/${itemId}/facebook-page/sync-comments`, { limit: 100 });
            setSyncResult(response.data.data);
            await loadItem();
        } catch (exception) {
            const errors = exception.response?.data?.errors;
            setError(errors ? Object.values(errors).flat().join(' ') : exception.response?.data?.message || 'Facebook Page comments could not be synced.');
        } finally {
            setIsSyncing(false);
        }
    }

    if (!item) {
        return (
            <div className="space-y-4">
                <Button type="button" variant="ghost" onClick={() => window.location.assign('/items')}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <p className="text-sm text-muted-foreground">{error || 'Loading item...'}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="button" variant="ghost" onClick={() => window.location.assign('/items')}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <Button type="button" variant="outline" onClick={() => window.location.assign(`/items/${item.id}/edit`)}>
                    <Edit className="h-4 w-4" />
                    Edit
                </Button>
            </div>

            {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

            <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle>{item.item_code}</CardTitle>
                        <CardDescription>{item.category?.name || 'Uncategorized'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                            {item.photo_url ? <img src={item.photo_url} alt="" className="h-full w-full object-cover" /> : null}
                        </div>
                        <label className="inline-flex">
                            <input type="file" accept="image/*" className="sr-only" onChange={uploadPhoto} />
                            <span className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm font-medium hover:bg-accent">
                                <Upload className="h-4 w-4" />
                                Upload photo
                            </span>
                        </label>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{item.item_name}</CardTitle>
                            <CardDescription>PHP {Number(item.selling_price || 0).toFixed(2)}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div>
                                <div className="text-sm text-muted-foreground">Status</div>
                                <div className="mt-1"><ItemStatusBadge status={item.status} /></div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Condition</div>
                                <div className="mt-1 text-sm">{item.condition || '-'}</div>
                            </div>
                            <div className="md:col-span-2">
                                <div className="text-sm text-muted-foreground">Description</div>
                                <p className="mt-1 text-sm leading-6">{item.description || '-'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <div className="text-sm text-muted-foreground">Facebook post</div>
                                {item.facebook_post_url ? <a href={item.facebook_post_url} target="_blank" rel="noreferrer" className="mt-1 block text-sm text-primary hover:underline">{item.facebook_post_url}</a> : <div className="mt-1 text-sm">-</div>}
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Facebook post ID</div>
                                <div className="mt-1 text-sm">{item.facebook_post_id || '-'}</div>
                            </div>
                            <div className="flex items-end">
                                <Button type="button" variant="outline" onClick={syncFacebookComments} disabled={isSyncing || (!item.facebook_post_url && !item.facebook_post_id)}>
                                    <RefreshCw className="h-4 w-4" />
                                    {isSyncing ? 'Syncing...' : 'Sync Page comments'}
                                </Button>
                            </div>
                            {syncResult ? (
                                <div className="md:col-span-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                                    Scanned {syncResult.scanned} comments. Created {syncResult.created?.length || 0} mines. Skipped {syncResult.skipped?.length || 0}.
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Change status</CardTitle>
                            <CardDescription>Status changes are logged for history.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3 sm:flex-row">
                            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                            </select>
                            <Button type="button" onClick={updateStatus}>Update status</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Mines</CardTitle>
                        <CardDescription>Miner history for this item.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-wrap gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setMineFormMode(mineFormMode === 'active' ? '' : 'active')}>Add first miner</Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => setMineFormMode(mineFormMode === 'backup' ? '' : 'backup')}>Add backup miner</Button>
                        </div>
                        {mineFormMode ? (
                            <div className="mb-4 rounded-lg border p-4">
                                <MineForm itemId={item.id} mode={mineFormMode} onSaved={() => { setMineFormMode(''); loadItem(); }} />
                            </div>
                        ) : null}
                        {item.mines?.length ? (
                            <div className="divide-y">
                                {item.mines.map((mine) => (
                                    <div key={mine.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                                        <div>
                                            <div className="font-medium">#{mine.mine_rank} {mine.customer?.name || 'Unknown customer'} · {mine.status}</div>
                                            <div className="text-muted-foreground">{mine.mine_text}</div>
                                            {mine.facebook_comment_url ? <a href={mine.facebook_comment_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">Open Facebook comment</a> : null}
                                        </div>
                                        {mine.status === 'active' ? (
                                            <Button type="button" variant="destructive" size="sm" onClick={() => cancelMine(mine)}>Cancel</Button>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-muted-foreground">No miners recorded yet.</p>}
                        {item.mines?.some((mine) => mine.status === 'backup') && !item.mines?.some((mine) => mine.status === 'active') ? (
                            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                                {confirmMove ? (
                                    <div className="space-y-3">
                                        <p className="text-sm text-amber-900">Confirm moving the next backup miner to active miner.</p>
                                        <div className="flex gap-2">
                                            <Button type="button" onClick={moveToNextMiner}>Confirm move</Button>
                                            <Button type="button" variant="outline" onClick={() => setConfirmMove(false)}>Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button type="button" onClick={() => setConfirmMove(true)}>Move to next miner</Button>
                                )}
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status history</CardTitle>
                        <CardDescription>Recent changes for this item.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {statusLogs.length ? (
                            <div className="divide-y">
                                {statusLogs.map((log) => (
                                    <div key={log.id} className="py-3 text-sm">
                                        <div className="font-medium">{log.old_status || 'New'} to {log.new_status}</div>
                                        <div className="text-muted-foreground">{log.notes || log.created_at}</div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-muted-foreground">No status changes yet.</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

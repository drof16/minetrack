import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import MineForm from '@/components/items/MineForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MineTrackerPage() {
    const [mines, setMines] = useState([]);
    const [error, setError] = useState('');
    const [confirmingItem, setConfirmingItem] = useState(null);
    const [activeItemId, setActiveItemId] = useState('');

    async function loadMines() {
        setError('');
        try {
            const response = await api.get('/mines', { params: { per_page: 100 } });
            setMines(response.data.data || []);
        } catch (exception) {
            setError(exception.response?.data?.message || 'Mines are not available yet.');
        }
    }

    useEffect(() => {
        loadMines();
    }, []);

    const grouped = useMemo(() => {
        const map = new Map();
        for (const mine of mines) {
            if (!mine.item) {
                continue;
            }
            const current = map.get(mine.item.id) || { item: mine.item, mines: [] };
            current.mines.push(mine);
            map.set(mine.item.id, current);
        }
        return Array.from(map.values());
    }, [mines]);

    async function cancelMine(mine) {
        try {
            await api.patch(`/mines/${mine.id}/cancel`, { notes: 'Cancelled by admin.' });
            await loadMines();
        } catch (exception) {
            setError(exception.response?.data?.message || 'Mine could not be cancelled.');
        }
    }

    async function moveToNextMiner(itemId) {
        try {
            await api.post(`/items/${itemId}/move-to-next-miner`, { confirm: true });
            setConfirmingItem(null);
            await loadMines();
        } catch (exception) {
            const errors = exception.response?.data?.errors;
            setError(errors ? Object.values(errors).flat().join(' ') : exception.response?.data?.message || 'Backup miner could not be moved.');
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-normal">Mine Tracker</h2>
                    <p className="text-sm text-muted-foreground">Manage active and backup miners without Facebook API automation.</p>
                </div>
                <Button type="button" variant="outline" onClick={loadMines}>
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

            <Card>
                <CardHeader>
                    <CardTitle>Record miner from item detail</CardTitle>
                    <CardDescription>Open an item detail page to add a first miner or backup miner for that item.</CardDescription>
                </CardHeader>
            </Card>

            <div className="space-y-4">
                {grouped.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-sm text-muted-foreground">No mine records yet.</CardContent>
                    </Card>
                ) : grouped.map(({ item, mines: itemMines }) => {
                    const active = itemMines.find((mine) => mine.status === 'active');
                    const backups = itemMines.filter((mine) => mine.status === 'backup').sort((a, b) => a.mine_rank - b.mine_rank);
                    const cancelled = itemMines.filter((mine) => mine.status === 'cancelled');

                    return (
                        <Card key={item.id}>
                            <CardHeader>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <CardTitle>{item.item_code} · {item.item_name}</CardTitle>
                                        <CardDescription>{item.category?.name || 'Uncategorized'} · {item.status}</CardDescription>
                                    </div>
                                    <Button type="button" variant="outline" onClick={() => window.location.assign(`/items/${item.id}`)}>Open item</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <section>
                                    <h3 className="text-sm font-medium">Active miner</h3>
                                    {active ? (
                                        <MineRow mine={active} action={<Button type="button" variant="destructive" size="sm" onClick={() => cancelMine(active)}>Cancel</Button>} />
                                    ) : <p className="mt-2 text-sm text-muted-foreground">No active miner.</p>}
                                </section>
                                <section>
                                    <h3 className="text-sm font-medium">Backup miners</h3>
                                    {backups.length ? backups.map((mine) => <MineRow key={mine.id} mine={mine} />) : <p className="mt-2 text-sm text-muted-foreground">No backup miners.</p>}
                                </section>
                                {cancelled.length ? (
                                    <section>
                                        <h3 className="text-sm font-medium">Cancelled miners</h3>
                                        {cancelled.map((mine) => <MineRow key={mine.id} mine={mine} />)}
                                    </section>
                                ) : null}
                                {!active && backups.length ? (
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                        {confirmingItem === item.id ? (
                                            <div className="space-y-3">
                                                <p className="text-sm text-amber-900">Confirm moving the next backup miner to active miner.</p>
                                                <div className="flex gap-2">
                                                    <Button type="button" onClick={() => moveToNextMiner(item.id)}>Confirm move</Button>
                                                    <Button type="button" variant="outline" onClick={() => setConfirmingItem(null)}>Cancel</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button type="button" onClick={() => setConfirmingItem(item.id)}>Move to next miner</Button>
                                        )}
                                    </div>
                                ) : null}
                                {activeItemId === item.id ? (
                                    <div className="rounded-lg border p-4">
                                        <MineForm itemId={item.id} mode="backup" onSaved={() => { setActiveItemId(''); loadMines(); }} />
                                    </div>
                                ) : (
                                    <Button type="button" variant="outline" onClick={() => setActiveItemId(item.id)}>Add backup miner</Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

function MineRow({ mine, action = null }) {
    return (
        <div className="mt-2 flex items-center justify-between gap-4 rounded-md border p-3 text-sm">
            <div>
                <div className="font-medium">#{mine.mine_rank} {mine.customer?.name || 'Unknown customer'} · {mine.status}</div>
                <div className="text-muted-foreground">{mine.mine_text}</div>
            </div>
            {action}
        </div>
    );
}

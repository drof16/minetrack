import { useState } from 'react';
import { Boxes, ClipboardList, CreditCard, Home, LogOut, Menu, Package, ReceiptText, Settings, Sparkles, Truck, Users, X } from 'lucide-react';
import { api } from '@/lib/api';

const navItems = [
    ['Dashboard', '/', Home],
    ['Items', '/items', Package],
    ['Quick Import', '/quick-import', Sparkles],
    ['Mine Tracker', '/mine-tracker', ClipboardList],
    ['Customers', '/customers', Users],
    ['Orders', '/orders', Boxes],
    ['Invoices', '/invoices', ReceiptText],
    ['Payments', '/payments', CreditCard],
    ['Packing', '/packing', ClipboardList],
    ['Pickup / Delivery', '/pickup-delivery', Truck],
    ['Reports', '/reports', ReceiptText],
    ['Settings', '/settings', Settings],
];

export default function AppLayout({ children, title = 'Dashboard', user = null }) {
    const currentPath = window.location.pathname;
    const [mobileOpen, setMobileOpen] = useState(false);

    const nav = (
        <nav className="mt-6 space-y-1">
            {navItems.map(([label, path, Icon]) => {
                const isActive = currentPath === path;

                return (
                    <button
                        key={label}
                        type="button"
                        onClick={() => window.location.assign(path)}
                        className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm ${
                            isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                );
            })}
        </nav>
    );

    async function logout() {
        await api.post('/logout').catch(() => {});
        window.location.assign('/login');
    }

    return (
        <div className="min-h-screen bg-background">
            <aside className="fixed inset-y-0 hidden w-64 border-r bg-card px-3 py-4 md:block">
                <div className="px-3 py-2">
                    <div className="text-lg font-semibold">MineTrack</div>
                    <div className="text-sm text-muted-foreground">Manual-first selling tracker</div>
                </div>
                {nav}
            </aside>
            {mobileOpen ? (
                <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur md:hidden">
                    <aside className="h-full w-72 border-r bg-card px-3 py-4 shadow-lg">
                        <div className="flex items-start justify-between px-3 py-2">
                            <div>
                                <div className="text-lg font-semibold">MineTrack</div>
                                <div className="text-sm text-muted-foreground">Manual-first selling tracker</div>
                            </div>
                            <button type="button" className="rounded-md p-2 hover:bg-muted" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        {nav}
                    </aside>
                </div>
            ) : null}
            <div className="md:pl-64">
                <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button type="button" className="rounded-md border p-2 md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
                                <Menu className="h-5 w-5" />
                            </button>
                            <div>
                                <div className="text-sm text-muted-foreground">{user?.name ? `${user.name} · MineTrack Admin` : 'MineTrack Admin'}</div>
                                <h1 className="text-xl font-semibold tracking-normal">{title}</h1>
                            </div>
                        </div>
                        <button type="button" className="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm hover:bg-muted" onClick={logout}>
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </header>
                <main className="p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}

const statusStyles = {
    Available: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Mined: 'bg-amber-50 text-amber-700 ring-amber-200',
    Sold: 'bg-slate-100 text-slate-700 ring-slate-200',
    Cancelled: 'bg-red-50 text-red-700 ring-red-200',
};

export default function ItemStatusBadge({ status }) {
    return (
        <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ring-1 ${statusStyles[status] || 'bg-muted text-muted-foreground ring-border'}`}>
            {status}
        </span>
    );
}

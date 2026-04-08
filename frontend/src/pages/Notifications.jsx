import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import { Bell, CheckCheck, Package, Truck, CheckCircle, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_META = {
    DONATION_CREATED: { icon: Package, bg: 'bg-emerald-100', color: 'text-emerald-600' },
    PICKUP_REQUESTED: { icon: Truck, bg: 'bg-blue-100', color: 'text-blue-600' },
    PICKUP_ASSIGNED: { icon: Truck, bg: 'bg-purple-100', color: 'text-purple-600' },
    DONATION_PICKED: { icon: Truck, bg: 'bg-amber-100', color: 'text-amber-600' },
    DONATION_DELIVERED: { icon: CheckCircle, bg: 'bg-emerald-100', color: 'text-emerald-600' },
    PICKUP_CANCELLED: { icon: AlertCircle, bg: 'bg-red-100', color: 'text-red-600' },
};

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export default function Notifications() {
    const [page, setPage] = useState(0);
    const qc = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['notifications', 'all', page],
        queryFn: () => notificationService.getAll(page, 20),
    });

    const markAllRead = useMutation({
        mutationFn: notificationService.markAllRead,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('All marked as read'); },
    });

    const markRead = useMutation({
        mutationFn: notificationService.markRead,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const notifications = data?.content ?? [];
    const unread = notifications.filter(n => !n.isRead).length;

    return (
        <div className="max-w-2xl space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title">Notifications</h1>
                    <p className="page-sub">{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
                </div>
                {unread > 0 && (
                    <button onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}
                        className="btn-secondary btn-sm flex items-center gap-1.5">
                        <CheckCheck size={13} /> Mark all read
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
                </div>
            ) : notifications.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                        <Bell size={22} className="text-gray-300" />
                    </div>
                    <p className="font-semibold text-gray-600">No notifications yet</p>
                    <p className="text-sm text-gray-400 mt-1">You'll see updates about your donations and pickups here.</p>
                </div>
            ) : (
                <div className="card divide-y divide-gray-50 overflow-hidden">
                    {notifications.map(n => {
                        const meta = TYPE_META[n.type] ?? { icon: Info, bg: 'bg-gray-100', color: 'text-gray-500' };
                        const Icon = meta.icon;
                        return (
                            <div key={n.notificationId}
                                onClick={() => !n.isRead && markRead.mutate(n.notificationId)}
                                className={`flex items-start gap-3.5 px-5 py-4 transition-colors cursor-pointer ${n.isRead ? 'hover:bg-gray-50/50' : 'bg-emerald-50/40 hover:bg-emerald-50'}`}>
                                <div className={`w-8 h-8 ${meta.bg} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
                                    <Icon size={15} className={meta.color} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm font-semibold ${n.isRead ? 'text-gray-600' : 'text-gray-900'}`}>{n.title}</p>
                                        <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                                </div>
                                {!n.isRead && <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0" />}
                            </div>
                        );
                    })}
                </div>
            )}

            {(data?.totalPages ?? 0) > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-secondary btn-sm">Previous</button>
                    <span className="text-xs text-gray-500 px-2">Page {page + 1} of {data.totalPages}</span>
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages - 1} className="btn-secondary btn-sm">Next</button>
                </div>
            )}
        </div>
    );
}

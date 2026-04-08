import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/auditService';
import Pagination from '../components/common/Pagination';
import { Shield, User, Clock, Filter } from 'lucide-react';

const ACTIONS = [
    'DONATION_CREATED', 'DONATION_STATUS_ADVANCED',
    'PICKUP_REQUESTED', 'PICKUP_CANCELLED',
    'DONATION_PICKED', 'DONATION_DELIVERED',
];

const ACTION_COLORS = {
    DONATION_CREATED: 'bg-emerald-100 text-emerald-700',
    DONATION_STATUS_ADVANCED: 'bg-blue-100 text-blue-700',
    PICKUP_REQUESTED: 'bg-amber-100 text-amber-700',
    PICKUP_CANCELLED: 'bg-red-100 text-red-700',
    DONATION_PICKED: 'bg-purple-100 text-purple-700',
    DONATION_DELIVERED: 'bg-green-100 text-green-700',
};

function timeAgo(dateStr) {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function AuditLogs() {
    const [page, setPage] = useState(0);
    const [filterAction, setFilterAction] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['audit-logs', page, filterAction],
        queryFn: () => filterAction
            ? auditService.getByAction(filterAction, page, 20)
            : auditService.getAll(page, 20),
        keepPreviousData: true,
    });

    const logs = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;

    return (
        <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <Shield size={20} className="text-purple-600" /> Audit Logs
                    </h1>
                    <p className="page-sub">Complete trail of all platform actions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-gray-400" />
                    <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(0); }}
                        className="field w-auto text-xs py-2">
                        <option value="">All actions</option>
                        {ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                    </select>
                </div>
            </div>

            <div className="card overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <div className="col-span-3">Action</div>
                    <div className="col-span-3">Performed By</div>
                    <div className="col-span-2">Entity</div>
                    <div className="col-span-2">Detail</div>
                    <div className="col-span-2 text-right">Time</div>
                </div>

                {isLoading ? (
                    <div className="divide-y divide-gray-50">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4">
                                {[3, 3, 2, 2, 2].map((span, j) => (
                                    <div key={j} className={`col-span-${span} skeleton h-4 rounded`} />
                                ))}
                            </div>
                        ))}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Shield size={32} className="mb-3 opacity-30" />
                        <p className="font-semibold">No audit logs found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {logs.map(log => (
                            <div key={log.id} className="grid grid-cols-12 gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors items-center">
                                <div className="col-span-3">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                                        {log.action?.replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div className="col-span-3 flex items-center gap-2 min-w-0">
                                    <User size={13} className="text-gray-400 shrink-0" />
                                    <span className="text-xs text-gray-700 truncate">{log.performedBy}</span>
                                </div>
                                <div className="col-span-2 text-xs text-gray-500">
                                    {log.entityType} {log.entityId ? `#${log.entityId}` : ''}
                                </div>
                                <div className="col-span-2 text-xs text-gray-400 truncate">{log.detail || '—'}</div>
                                <div className="col-span-2 text-right flex items-center justify-end gap-1 text-xs text-gray-400">
                                    <Clock size={11} />
                                    {timeAgo(log.performedAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
    );
}

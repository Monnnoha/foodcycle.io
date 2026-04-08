import { useState } from 'react';
import { usePickups, useMarkPicked, useMarkDelivered } from '../hooks/usePickups';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/common/Pagination';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { Truck, User, Building2, CheckCircle, Clock, Package } from 'lucide-react';

function PickupCard({ pickup }) {
    const { hasRole } = useAuth();
    const markPicked = useMarkPicked();
    const markDelivered = useMarkDelivered();
    const { pickupId, donationId, donationDescription, donationStatus, volunteerId, ngoId } = pickup;

    return (
        <div className="card-hover p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{donationDescription ?? `Donation #${donationId}`}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Pickup #{pickupId}</p>
                </div>
                <StatusBadge status={donationStatus} />
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                    <User size={12} className="text-gray-400" /> Volunteer #{volunteerId}
                </span>
                <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                    <Building2 size={12} className="text-gray-400" /> NGO #{ngoId}
                </span>
            </div>

            <div className="flex gap-2 pt-1">
                {hasRole('VOLUNTEER', 'ADMIN') && donationStatus === 'REQUESTED' && (
                    <button onClick={() => markPicked.mutate(donationId)} disabled={markPicked.isPending}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors">
                        <Truck size={12} /> Mark Picked Up
                    </button>
                )}
                {hasRole('VOLUNTEER', 'NGO', 'ADMIN') && donationStatus === 'PICKED' && (
                    <button onClick={() => markDelivered.mutate(donationId)} disabled={markDelivered.isPending}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-semibold transition-colors">
                        <CheckCircle size={12} /> Mark Delivered
                    </button>
                )}
                {donationStatus === 'DELIVERED' && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                        <CheckCircle size={12} /> Delivered
                    </span>
                )}
            </div>
        </div>
    );
}

export default function Pickups() {
    const [page, setPage] = useState(0);
    const { data, isLoading } = usePickups(page, 10);
    const pickups = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;

    const counts = {
        requested: pickups.filter(p => p.donationStatus === 'REQUESTED').length,
        picked: pickups.filter(p => p.donationStatus === 'PICKED').length,
        delivered: pickups.filter(p => p.donationStatus === 'DELIVERED').length,
    };

    return (
        <div className="space-y-5">
            <div>
                <h1 className="page-title">Pickups</h1>
                <p className="page-sub">Manage food pickup and delivery workflow</p>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Requested', count: counts.requested, icon: Clock, bg: 'bg-amber-50', icon_c: 'bg-amber-100 text-amber-600', text: 'text-amber-700' },
                    { label: 'Picked Up', count: counts.picked, icon: Truck, bg: 'bg-blue-50', icon_c: 'bg-blue-100 text-blue-600', text: 'text-blue-700' },
                    { label: 'Delivered', count: counts.delivered, icon: CheckCircle, bg: 'bg-emerald-50', icon_c: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-700' },
                ].map(({ label, count, icon: Icon, bg, icon_c, text }) => (
                    <div key={label} className={`${bg} rounded-xl p-4 flex items-center gap-3 border border-white/60`}>
                        <div className={`w-9 h-9 ${icon_c} rounded-lg flex items-center justify-center shrink-0`}>
                            <Icon size={16} />
                        </div>
                        <div>
                            <p className={`text-lg font-bold text-gray-900 tabular-nums`}>{count}</p>
                            <p className={`text-xs font-semibold ${text}`}>{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
                </div>
            ) : pickups.length === 0 ? (
                <EmptyState icon={Truck} title="No pickups yet" sub="Pickup requests will appear here once volunteers request them." />
            ) : (
                <div className="space-y-3">
                    {pickups.map(p => <PickupCard key={p.pickupId} pickup={p} />)}
                </div>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
    );
}

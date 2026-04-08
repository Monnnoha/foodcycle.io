import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMyDonations } from '../hooks/useDonations';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { Package, MapPin, Calendar, ChevronRight, Plus } from 'lucide-react';

export default function MyDonations() {
    const { user } = useAuth();
    const { data: donations = [], isLoading } = useMyDonations(user?.id);

    const counts = {
        AVAILABLE: donations.filter(d => d.status === 'AVAILABLE').length,
        REQUESTED: donations.filter(d => d.status === 'REQUESTED').length,
        PICKED: donations.filter(d => d.status === 'PICKED').length,
        DELIVERED: donations.filter(d => d.status === 'DELIVERED').length,
    };

    return (
        <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="page-title">My Donations</h1>
                    <p className="page-sub">{donations.length} total donations you've created</p>
                </div>
                <Link to="/donations" className="btn-primary flex items-center gap-2">
                    <Plus size={15} /> New Donation
                </Link>
            </div>

            {/* Summary strip */}
            {!isLoading && donations.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: 'Available', key: 'AVAILABLE', color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Requested', key: 'REQUESTED', color: 'bg-amber-50 text-amber-700' },
                        { label: 'Picked', key: 'PICKED', color: 'bg-blue-50 text-blue-700' },
                        { label: 'Delivered', key: 'DELIVERED', color: 'bg-purple-50 text-purple-700' },
                    ].map(({ label, key, color }) => (
                        <div key={key} className={`${color} rounded-xl p-4 text-center border border-white/60`}>
                            <p className="text-2xl font-bold tabular-nums">{counts[key]}</p>
                            <p className="text-xs font-semibold mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* List */}
            <div className="card overflow-hidden">
                {isLoading ? (
                    <div className="divide-y divide-gray-50">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 px-5 py-4">
                                <div className="skeleton h-10 w-10 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <div className="skeleton h-3.5 w-48 rounded" />
                                    <div className="skeleton h-3 w-32 rounded" />
                                </div>
                                <div className="skeleton h-6 w-20 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : donations.length === 0 ? (
                    <EmptyState icon={Package} title="No donations yet"
                        sub="Start sharing surplus food with your community"
                        action={<Link to="/donations" className="btn-primary">Create First Donation</Link>} />
                ) : (
                    <div className="divide-y divide-gray-50">
                        {donations.map(d => (
                            <Link key={d.donationId} to={`/donations/${d.donationId}`}
                                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors group">
                                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                                    <Package size={18} className="text-emerald-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{d.foodDescription}</p>
                                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                                        {d.city && <span className="flex items-center gap-1"><MapPin size={10} />{d.city}</span>}
                                        {d.expiryDate && <span className="flex items-center gap-1"><Calendar size={10} />Expires {d.expiryDate}</span>}
                                        <span>{d.quantity} units</span>
                                    </div>
                                </div>
                                <StatusBadge status={d.status} />
                                <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

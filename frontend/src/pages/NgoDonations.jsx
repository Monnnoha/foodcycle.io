import { useAuth } from '../context/AuthContext';
import { useDonationSearch, useNgoAccept } from '../hooks/useDonations';
import { useState } from 'react';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { Package, MapPin, Calendar, CheckCircle, Clock } from 'lucide-react';

function DonationReviewCard({ donation, onAccept, accepting }) {
    const { donationId, foodDescription, foodType, city, location, quantity, expiryDate, status, createdAt } = donation;

    return (
        <div className="card p-5 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{foodDescription}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {foodType && <span className="mr-2">{foodType}</span>}
                        Added {createdAt?.split('T')[0]}
                    </p>
                </div>
                <StatusBadge status={status} />
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                    <Package size={11} /> {quantity} units
                </span>
                {city && (
                    <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                        <MapPin size={11} /> {city}
                    </span>
                )}
                {location && (
                    <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                        <MapPin size={11} /> {location}
                    </span>
                )}
                {expiryDate && (
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1.5 rounded-lg">
                        <Calendar size={11} /> Expires {expiryDate}
                    </span>
                )}
            </div>

            {status === 'AVAILABLE' && (
                <div className="flex gap-2 pt-1">
                    <button
                        onClick={() => onAccept(donationId)}
                        disabled={accepting}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-semibold transition-colors">
                        {accepting
                            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <CheckCircle size={14} />
                        }
                        Accept Donation
                    </button>
                </div>
            )}

            {status !== 'AVAILABLE' && (
                <p className="text-xs text-gray-400 italic">Already accepted or in progress</p>
            )}
        </div>
    );
}

export default function NgoDonations() {
    const { user } = useAuth();
    const [page, setPage] = useState(0);
    const [acceptingId, setAcceptingId] = useState(null);

    const { data, isLoading } = useDonationSearch({ status: 'AVAILABLE', page, size: 12, sortBy: 'createdAt', sortDir: 'desc' });
    const ngoAccept = useNgoAccept();

    const donations = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;

    const handleAccept = async (donationId) => {
        if (!user?.id) return;
        setAcceptingId(donationId);
        try {
            await ngoAccept.mutateAsync({ donationId, ngoId: user.id });
        } finally {
            setAcceptingId(null);
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="page-title">Donations Awaiting Review</h1>
                    <p className="page-sub">
                        Accept donations to notify volunteers for pickup
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <Clock size={14} className="text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700">{data?.totalElements ?? 0} pending</span>
                </div>
            </div>

            {/* Info banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-700">
                    When you accept a donation, <strong>all volunteers</strong> on the platform are notified and can request pickup.
                </p>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 rounded-xl" />)}
                </div>
            ) : donations.length === 0 ? (
                <EmptyState icon={Package} title="No donations awaiting review"
                    sub="New donations from donors will appear here for your review." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {donations.map(d => (
                        <DonationReviewCard
                            key={d.donationId}
                            donation={d}
                            onAccept={handleAccept}
                            accepting={acceptingId === d.donationId}
                        />
                    ))}
                </div>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
    );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDonationSearch, useCreateDonation } from '../hooks/useDonations';
import { useRequestPickup } from '../hooks/usePickups';
import DonationCard from '../components/donations/DonationCard';
import Pagination from '../components/common/Pagination';

export default function Donations() {
    const { hasRole } = useAuth();
    const [page, setPage] = useState(0);
    const [filters, setFilters] = useState({ status: '', city: '', foodType: '', keyword: '' });

    const { data, isLoading } = useDonationSearch({ ...filters, page, size: 12 });
    const createDonation = useCreateDonation();
    const requestPickup = useRequestPickup();

    const donations = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
                {hasRole('DONOR') && (
                    <button
                        onClick={() => {/* open create modal */ }}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                        + New Donation
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                {['keyword', 'city', 'foodType'].map(key => (
                    <input
                        key={key}
                        placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                        value={filters[key]}
                        onChange={e => { setFilters(f => ({ ...f, [key]: e.target.value })); setPage(0); }}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                ))}
                <select
                    value={filters.status}
                    onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(0); }}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="">All statuses</option>
                    {['AVAILABLE', 'REQUESTED', 'PICKED', 'DELIVERED'].map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <p className="text-gray-400 text-sm">Loading…</p>
            ) : donations.length === 0 ? (
                <p className="text-gray-400 text-sm">No donations found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {donations.map(d => (
                        <DonationCard
                            key={d.donationId}
                            donation={d}
                            actions={
                                hasRole('VOLUNTEER') && d.status === 'AVAILABLE' ? (
                                    <button
                                        onClick={() => requestPickup.mutate({ donationId: d.donationId })}
                                        className="ml-auto px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Request Pickup
                                    </button>
                                ) : null
                            }
                        />
                    ))}
                </div>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
    );
}

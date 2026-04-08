import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useDonationSearch, useCreateDonation } from '../hooks/useDonations';
import { useRequestPickup } from '../hooks/usePickups';
import DonationCard from '../components/donations/DonationCard';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { Plus, Search, Filter, Upload, Package, SlidersHorizontal } from 'lucide-react';
import { STATUSES, FOOD_TYPES } from '../lib/constants';
import toast from 'react-hot-toast';

/* ── Create Donation Form ── */
function CreateDonationForm({ onClose }) {
    const { user } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const createDonation = useCreateDonation();
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const onSubmit = async (values) => {
        if (!user?.id) { toast.error('User session expired. Please log in again.'); return; }
        await createDonation.mutateAsync({
            donationData: { ...values, donorId: user.id, quantity: Number(values.quantity) },
            imageFile,
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="field-label">Food Description *</label>
                <textarea rows={2} {...register('foodDescription', { required: 'Required' })}
                    placeholder="e.g. 10kg of cooked rice and dal"
                    className="field resize-none" />
                {errors.foodDescription && <p className="field-error">{errors.foodDescription.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="field-label">Food Type</label>
                    <select {...register('foodType')} className="field">
                        <option value="">Select type</option>
                        {FOOD_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className="field-label">Quantity (units) *</label>
                    <input type="number" min="1" {...register('quantity', { required: 'Required', min: 1 })}
                        placeholder="10" className="field" />
                    {errors.quantity && <p className="field-error">{errors.quantity.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="field-label">City</label>
                    <input {...register('city')} placeholder="Mumbai" className="field" />
                </div>
                <div>
                    <label className="field-label">Expiry Date</label>
                    <input type="date" {...register('expiryDate')}
                        min={new Date().toISOString().split('T')[0]} className="field" />
                </div>
            </div>
            <div>
                <label className="field-label">Location / Address</label>
                <input {...register('location')} placeholder="Street address or landmark" className="field" />
            </div>
            <div>
                <label className="field-label">Photo (optional)</label>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all overflow-hidden">
                    {preview
                        ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                        : <div className="flex flex-col items-center gap-2 text-gray-400"><Upload size={22} /><span className="text-xs">Click to upload</span></div>
                    }
                    <input type="file" accept="image/*" className="sr-only"
                        onChange={e => { const f = e.target.files[0]; if (f) { setImageFile(f); setPreview(URL.createObjectURL(f)); } }} />
                </label>
            </div>
            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                    {isSubmitting ? 'Creating…' : 'Create Donation'}
                </button>
            </div>
        </form>
    );
}

/* ── Request Pickup Form ── */
function RequestPickupForm({ donation, onClose }) {
    const { user } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const requestPickup = useRequestPickup();

    const onSubmit = async (values) => {
        await requestPickup.mutateAsync({
            donationId: donation.donationId,
            volunteerId: user?.id,
            ngoId: Number(values.ngoId),
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <p className="font-semibold text-gray-900">{donation.foodDescription}</p>
                <p className="text-sm text-gray-500 mt-1">{donation.city} · {donation.quantity} units</p>
            </div>
            <div>
                <label className="field-label">NGO User ID *</label>
                <input type="number" {...register('ngoId', { required: 'Required', min: { value: 1, message: 'Invalid ID' } })}
                    placeholder="Enter the NGO's user ID" className="field" />
                {errors.ngoId && <p className="field-error">{errors.ngoId.message}</p>}
                <p className="text-xs text-gray-400 mt-1">Ask your NGO coordinator for their user ID from their Profile page.</p>
            </div>
            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                    {isSubmitting ? 'Requesting…' : 'Request Pickup'}
                </button>
            </div>
        </form>
    );
}

/* ── Main Page ── */
export default function Donations() {
    const { user, hasRole } = useAuth();
    const [page, setPage] = useState(0);
    const [showCreate, setShowCreate] = useState(false);
    const [pickupTarget, setPickupTarget] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: '', city: '', foodType: '', keyword: '',
        sortBy: 'createdAt', sortDir: 'desc',
    });

    const { data, isLoading, isError } = useDonationSearch({ ...filters, page, size: 12 });
    const donations = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;

    const set = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setPage(0); };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{totalElements} total donations</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setShowFilters(f => !f)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${showFilters ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <SlidersHorizontal size={15} /> Filters
                    </button>
                    {hasRole('DONOR') && (
                        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
                            <Plus size={15} /> New Donation
                        </button>
                    )}
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={filters.keyword} onChange={e => set('keyword', e.target.value)}
                    placeholder="Search donations by description, food type, city…"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm" />
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Status', key: 'status', options: STATUSES },
                        { label: 'Food Type', key: 'foodType', options: FOOD_TYPES },
                    ].map(({ label, key, options }) => (
                        <div key={key}>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                            <select value={filters[key]} onChange={e => set(key, e.target.value)} className="field">
                                <option value="">All</option>
                                {options.map(o => <option key={o}>{o}</option>)}
                            </select>
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">City</label>
                        <input value={filters.city} onChange={e => set('city', e.target.value)}
                            placeholder="Any city" className="field" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Sort</label>
                        <select value={`${filters.sortBy}_${filters.sortDir}`}
                            onChange={e => { const [by, dir] = e.target.value.split('_'); setFilters(f => ({ ...f, sortBy: by, sortDir: dir })); setPage(0); }}
                            className="field">
                            <option value="createdAt_desc">Newest First</option>
                            <option value="createdAt_asc">Oldest First</option>
                            <option value="expiryDate_asc">Expiry Soonest</option>
                            <option value="quantity_desc">Quantity High</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-60 animate-pulse" />)}
                </div>
            ) : isError ? (
                <div className="text-center py-16 text-red-500">Failed to load donations. Please try again.</div>
            ) : donations.length === 0 ? (
                <EmptyState icon={Package} title="No donations found" sub="Try adjusting your search or filters"
                    action={hasRole('DONOR') && <button onClick={() => setShowCreate(true)} className="btn-primary">Create First Donation</button>} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {donations.map(d => (
                        <DonationCard key={d.donationId} donation={d}
                            onRequestPickup={hasRole('VOLUNTEER') && d.status === 'AVAILABLE' ? () => setPickupTarget(d) : null}
                        />
                    ))}
                </div>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />

            {showCreate && (
                <Modal title="Create New Donation" onClose={() => setShowCreate(false)}>
                    <CreateDonationForm onClose={() => setShowCreate(false)} />
                </Modal>
            )}
            {pickupTarget && (
                <Modal title="Request Pickup" onClose={() => setPickupTarget(null)}>
                    <RequestPickupForm donation={pickupTarget} onClose={() => setPickupTarget(null)} />
                </Modal>
            )}
        </div>
    );
}

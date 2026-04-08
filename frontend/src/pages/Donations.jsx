import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useDonationSearch, useCreateDonation } from '../hooks/useDonations';
import { useRequestPickup } from '../hooks/usePickups';
import { useDebounce } from '../hooks/useDebounce';
import DonationCard from '../components/donations/DonationCard';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import ImageUpload from '../components/common/ImageUpload';
import { Plus, Search, Package, SlidersHorizontal, X } from 'lucide-react';
import { STATUSES, FOOD_TYPES } from '../lib/constants';
import toast from 'react-hot-toast';

/* ── Filter chip ── */
function FilterChip({ label, active, onClick }) {
    return (
        <button onClick={onClick}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 whitespace-nowrap active:scale-95 ${active
                    ? 'bg-green-600 text-white border-green-600 shadow-sm shadow-green-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-700'
                }`}>
            {label}
        </button>
    );
}

/* ── Create Donation Form ── */
function CreateDonationForm({ onClose }) {
    const { user } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const createDonation = useCreateDonation();
    const [image, setImage] = useState(null);

    const onSubmit = async (values) => {
        if (!user?.id) { toast.error('Session expired. Please log in again.'); return; }
        await createDonation.mutateAsync({
            donationData: { ...values, donorId: user.id, quantity: Number(values.quantity) },
            imageFile: image?.file ?? null,
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

            <ImageUpload value={image} onChange={setImage} />

            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                    {isSubmitting
                        ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</span>
                        : 'Create Donation'
                    }
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
                <p className="text-xs text-gray-400 mt-1.5">Find the NGO's user ID on their Profile page.</p>
            </div>
            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={isSubmitting}
                    className="flex-1 btn bg-blue-600 text-white hover:bg-blue-700">
                    {isSubmitting ? 'Requesting…' : 'Request Pickup'}
                </button>
            </div>
        </form>
    );
}

/* ── Status filter chips ── */
const STATUS_CHIPS = [
    { label: 'All', value: '' },
    { label: 'Available', value: 'AVAILABLE' },
    { label: 'Requested', value: 'REQUESTED' },
    { label: 'Picked', value: 'PICKED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Expired', value: 'EXPIRED' },
];

const FOOD_CHIPS = ['All', ...FOOD_TYPES];

/* ── Main Page ── */
export default function Donations() {
    const { user, hasRole } = useAuth();
    const [page, setPage] = useState(0);
    const [showCreate, setShowCreate] = useState(false);
    const [pickupTarget, setPickupTarget] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [rawKeyword, setRawKeyword] = useState('');
    const [filters, setFilters] = useState({
        status: '', city: '', foodType: '',
        sortBy: 'createdAt', sortDir: 'desc',
    });

    const keyword = useDebounce(rawKeyword, 400);
    const { data, isLoading, isError } = useDonationSearch({ ...filters, keyword, page, size: 12 });
    const donations = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;

    const set = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setPage(0); };

    const activeFilterCount = [filters.status, filters.city, filters.foodType].filter(Boolean).length;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="page-title">Donations</h1>
                    <p className="page-sub">{totalElements} donations available</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setShowAdvanced(v => !v)}
                        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${showAdvanced ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <SlidersHorizontal size={14} /> Filters
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                    {hasRole('DONOR') && (
                        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
                            <Plus size={14} /> New Donation
                        </button>
                    )}
                </div>
            </div>

            {/* Search bar */}
            <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                    value={rawKeyword}
                    onChange={e => { setRawKeyword(e.target.value); setPage(0); }}
                    placeholder="Search by food description, type, city…"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white shadow-sm transition-all"
                />
                {rawKeyword && (
                    <button onClick={() => { setRawKeyword(''); setPage(0); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Status filter chips — always visible */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {STATUS_CHIPS.map(chip => (
                    <FilterChip key={chip.value} label={chip.label}
                        active={filters.status === chip.value}
                        onClick={() => { set('status', chip.value); }} />
                ))}
            </div>

            {/* Advanced filters */}
            {showAdvanced && (
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-4 animate-slide-up">
                    {/* Food type chips */}
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Food Type</p>
                        <div className="flex gap-2 flex-wrap">
                            {FOOD_CHIPS.map(t => (
                                <FilterChip key={t} label={t}
                                    active={t === 'All' ? !filters.foodType : filters.foodType === t}
                                    onClick={() => set('foodType', t === 'All' ? '' : t)} />
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="field-label">City</label>
                            <input value={filters.city} onChange={e => set('city', e.target.value)}
                                placeholder="Any city" className="field" />
                        </div>
                        <div>
                            <label className="field-label">Sort By</label>
                            <select value={`${filters.sortBy}_${filters.sortDir}`}
                                onChange={e => {
                                    const [by, dir] = e.target.value.split('_');
                                    setFilters(f => ({ ...f, sortBy: by, sortDir: dir }));
                                    setPage(0);
                                }}
                                className="field">
                                <option value="createdAt_desc">Newest First</option>
                                <option value="createdAt_asc">Oldest First</option>
                                <option value="expiryDate_asc">Expiry Soonest</option>
                                <option value="quantity_desc">Quantity High</option>
                            </select>
                        </div>
                    </div>

                    {activeFilterCount > 0 && (
                        <button onClick={() => { setFilters({ status: '', city: '', foodType: '', sortBy: 'createdAt', sortDir: 'desc' }); setPage(0); }}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors">
                            <X size={12} /> Clear all filters
                        </button>
                    )}
                </div>
            )}

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="card overflow-hidden">
                            <div className="skeleton h-44 rounded-none" />
                            <div className="p-4 space-y-3">
                                <div className="skeleton h-4 w-3/4 rounded" />
                                <div className="skeleton h-3 w-1/2 rounded" />
                                <div className="skeleton h-3 w-2/3 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : isError ? (
                <div className="card p-12 text-center">
                    <p className="text-red-500 font-semibold">Failed to load donations</p>
                    <p className="text-gray-400 text-sm mt-1">Check your connection and try again.</p>
                </div>
            ) : donations.length === 0 ? (
                <EmptyState icon={Package} title="No donations found"
                    sub="Try adjusting your search or filters"
                    action={hasRole('DONOR') && (
                        <button onClick={() => setShowCreate(true)} className="btn-primary">
                            Create First Donation
                        </button>
                    )} />
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

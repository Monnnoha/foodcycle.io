import { useState } from 'react';
import { useNearbyDonations } from '../hooks/useDonations';
import { useRequestPickup } from '../hooks/usePickups';
import { useAuth } from '../context/AuthContext';
import DonationCard from '../components/donations/DonationCard';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { MapPin, Navigation, Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { donationService } from '../services/donationService';

function RequestPickupForm({ donation, onClose }) {
    const { user } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const requestPickup = useRequestPickup();
    const onSubmit = async (values) => {
        await requestPickup.mutateAsync({ donationId: donation.donationId, volunteerId: user?.id, ngoId: Number(values.ngoId) });
        onClose();
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-emerald-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900">{donation.foodDescription}</p>
                <p className="text-sm text-gray-500">{donation.distanceKm} km away · {donation.quantity} units</p>
            </div>
            <div>
                <label className="field-label">NGO User ID *</label>
                <input type="number" {...register('ngoId', { required: 'Required', min: 1 })} placeholder="NGO user ID" className="field" />
                {errors.ngoId && <p className="field-error">{errors.ngoId.message}</p>}
            </div>
            <div className="flex gap-3">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                    {isSubmitting ? 'Requesting…' : 'Request Pickup'}
                </button>
            </div>
        </form>
    );
}

export default function NearbyDonations() {
    const { hasRole } = useAuth();
    const [coords, setCoords] = useState(null);
    const [locating, setLocating] = useState(false);
    const [radiusKm, setRadiusKm] = useState(10);
    const [page, setPage] = useState(0);
    const [pickupTarget, setPickupTarget] = useState(null);

    const { data, isLoading } = useNearbyDonations(
        coords ? { lat: coords.lat, lon: coords.lon, radiusKm, page, size: 12 } : null
    );

    const donations = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;

    const locate = () => {
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            pos => { setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setLocating(false); },
            () => { setLocating(false); alert('Location access denied.'); }
        );
    };

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Nearby Donations</h1>
                <p className="text-sm text-gray-500 mt-0.5">Find available food donations near your location</p>
            </div>

            <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button onClick={locate} disabled={locating}
                    className="flex items-center gap-2 btn-primary">
                    {locating ? <Loader size={16} className="animate-spin" /> : <Navigation size={16} />}
                    {locating ? 'Locating…' : coords ? 'Update Location' : 'Use My Location'}
                </button>
                {coords && (
                    <p className="text-sm text-gray-500">
                        <MapPin size={14} className="inline mr-1" />
                        {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
                    </p>
                )}
                <div className="flex items-center gap-2 ml-auto">
                    <label className="text-sm font-medium text-gray-600">Radius:</label>
                    {[5, 10, 25, 50].map(r => (
                        <button key={r} onClick={() => { setRadiusKm(r); setPage(0); }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${radiusKm === r ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {r}km
                        </button>
                    ))}
                </div>
            </div>

            {!coords ? (
                <EmptyState icon={MapPin} title="Enable location to find nearby donations"
                    sub="Click 'Use My Location' to see food donations near you"
                    action={<button onClick={locate} className="btn-primary">Enable Location</button>} />
            ) : isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-60 animate-pulse" />)}
                </div>
            ) : donations.length === 0 ? (
                <EmptyState icon={MapPin} title="No donations nearby" sub={`No available donations within ${radiusKm}km. Try increasing the radius.`} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {donations.map(d => (
                        <DonationCard key={d.donationId} donation={d}
                            onRequestPickup={hasRole('VOLUNTEER') ? () => setPickupTarget(d) : null} />
                    ))}
                </div>
            )}

            {coords && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}

            {pickupTarget && (
                <Modal title="Request Pickup" onClose={() => setPickupTarget(null)}>
                    <RequestPickupForm donation={pickupTarget} onClose={() => setPickupTarget(null)} />
                </Modal>
            )}
        </div>
    );
}

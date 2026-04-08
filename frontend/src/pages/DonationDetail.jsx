import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donationService } from '../services/donationService';
import { pickupService } from '../services/pickupService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import { MapPin, Package, Calendar, Tag, ArrowLeft, ChevronRight, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DonationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const qc = useQueryClient();

    const { data: donation, isLoading } = useQuery({
        queryKey: ['donations', id],
        queryFn: () => donationService.getById(id),
    });

    const advance = useMutation({
        mutationFn: () => donationService.advanceStatus(id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['donations'] }); toast.success('Status advanced'); },
        onError: err => toast.error(err.message),
    });

    if (isLoading) return (
        <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
    );

    if (!donation) return <div className="text-center py-20 text-gray-400">Donation not found.</div>;

    const steps = ['AVAILABLE', 'REQUESTED', 'PICKED', 'DELIVERED'];
    const currentStep = steps.indexOf(donation.status);

    return (
        <div className="max-w-2xl space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-medium">
                <ArrowLeft size={16} /> Back
            </button>

            <div className="card overflow-hidden">
                {donation.imageUrl && (
                    <img src={donation.imageUrl} alt={donation.foodDescription} className="w-full h-56 object-cover" />
                )}
                <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <h1 className="text-xl font-bold text-gray-900">{donation.foodDescription}</h1>
                        <StatusBadge status={donation.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        {[
                            { icon: Package, label: 'Quantity', value: `${donation.quantity} units` },
                            { icon: Tag, label: 'Food Type', value: donation.foodType || '—' },
                            { icon: MapPin, label: 'City', value: donation.city || '—' },
                            { icon: MapPin, label: 'Location', value: donation.location || '—' },
                            { icon: Calendar, label: 'Expiry', value: donation.expiryDate || '—' },
                            { icon: Calendar, label: 'Created', value: donation.createdAt?.split('T')[0] || '—' },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                                <Icon size={15} className="text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                                    <p className="font-semibold text-gray-800 mt-0.5">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Status timeline */}
            {donation.status !== 'EXPIRED' && (
                <div className="card p-6">
                    <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Donation Journey</h2>
                    <div className="flex items-center gap-0">
                        {steps.map((step, i) => (
                            <div key={step} className="flex items-center flex-1">
                                <div className={`flex flex-col items-center flex-1 ${i < steps.length - 1 ? '' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i <= currentStep ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                                        {i < currentStep ? '✓' : i + 1}
                                    </div>
                                    <p className={`text-xs mt-1.5 font-medium text-center ${i <= currentStep ? 'text-green-700' : 'text-gray-400'}`}>{step}</p>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`h-0.5 flex-1 mx-1 mb-5 ${i < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Admin advance */}
            {hasRole('ADMIN') && !['DELIVERED', 'EXPIRED'].includes(donation.status) && (
                <div className="card p-5 flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-gray-800">Advance Status</p>
                        <p className="text-sm text-gray-500">Move this donation to the next stage</p>
                    </div>
                    <button onClick={() => advance.mutate()} disabled={advance.isPending}
                        className="flex items-center gap-2 btn-primary">
                        <ChevronRight size={16} /> Advance
                    </button>
                </div>
            )}
        </div>
    );
}

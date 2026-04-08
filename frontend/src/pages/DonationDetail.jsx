import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donationService } from '../services/donationService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import ImageUpload from '../components/common/ImageUpload';
import Modal from '../components/common/Modal';
import { MapPin, Package, Calendar, Tag, ArrowLeft, ChevronRight, Camera, User } from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Status timeline ── */
const STEPS = ['AVAILABLE', 'REQUESTED', 'PICKED', 'DELIVERED'];

function Timeline({ status }) {
    if (status === 'EXPIRED') return (
        <div className="card p-5 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-red-600 text-sm">✕</span>
            </div>
            <div>
                <p className="font-semibold text-red-700 text-sm">Donation Expired</p>
                <p className="text-xs text-gray-400">This donation passed its expiry date.</p>
            </div>
        </div>
    );

    const current = STEPS.indexOf(status);

    return (
        <div className="card p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">Donation Journey</p>
            <div className="relative">
                {/* Track */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100" />
                <div className="absolute top-4 left-4 h-0.5 bg-green-500 transition-all duration-700"
                    style={{ width: current > 0 ? `${(current / (STEPS.length - 1)) * 100}%` : '0%' }} />

                <div className="relative flex justify-between">
                    {STEPS.map((step, i) => {
                        const done = i < current;
                        const active = i === current;
                        return (
                            <div key={step} className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 z-10 ${done ? 'bg-green-600 border-green-600 text-white shadow-sm shadow-green-200' :
                                        active ? 'bg-white border-green-600 text-green-600 shadow-sm shadow-green-200 ring-4 ring-green-100' :
                                            'bg-white border-gray-200 text-gray-300'
                                    }`}>
                                    {done ? '✓' : i + 1}
                                </div>
                                <p className={`text-[10px] font-semibold text-center ${done || active ? 'text-green-700' : 'text-gray-400'
                                    }`}>{step}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ── Image upload modal ── */
function UploadImageModal({ donationId, onClose }) {
    const [image, setImage] = useState(null);
    const qc = useQueryClient();

    const upload = useMutation({
        mutationFn: () => donationService.uploadImage(donationId, image.file),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['donations', String(donationId)] });
            toast.success('Image updated');
            onClose();
        },
        onError: err => toast.error(err.message),
    });

    return (
        <div className="space-y-4">
            <ImageUpload value={image} onChange={setImage} label="New donation photo" />
            <div className="flex gap-3">
                <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button onClick={() => upload.mutate()} disabled={!image || upload.isPending} className="btn-primary flex-1">
                    {upload.isPending ? 'Uploading…' : 'Upload Image'}
                </button>
            </div>
        </div>
    );
}

/* ── Info row ── */
function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3 bg-gray-50/80 rounded-xl p-3.5">
            <Icon size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 break-words">{value || '—'}</p>
            </div>
        </div>
    );
}

export default function DonationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const qc = useQueryClient();
    const [showUpload, setShowUpload] = useState(false);

    const { data: donation, isLoading, isError } = useQuery({
        queryKey: ['donations', id],
        queryFn: () => donationService.getById(id),
    });

    const advance = useMutation({
        mutationFn: () => donationService.advanceStatus(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['donations'] });
            toast.success('Status advanced successfully');
        },
        onError: err => toast.error(err.message),
    });

    if (isLoading) return (
        <div className="max-w-2xl space-y-4 animate-pulse">
            <div className="skeleton h-6 w-24 rounded" />
            <div className="skeleton h-56 rounded-xl" />
            <div className="skeleton h-48 rounded-xl" />
        </div>
    );

    if (isError || !donation) return (
        <div className="card p-16 text-center max-w-md mx-auto">
            <Package size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-600">Donation not found</p>
            <button onClick={() => navigate('/donations')} className="btn-secondary mt-4 btn-sm">
                Back to Donations
            </button>
        </div>
    );

    return (
        <div className="max-w-2xl space-y-5 animate-slide-up">
            {/* Back */}
            <button onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors group">
                <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" /> Back
            </button>

            {/* Main card */}
            <div className="card overflow-hidden">
                {/* Image */}
                <div className="relative group">
                    {donation.imageUrl ? (
                        <img src={donation.imageUrl} alt={donation.foodDescription}
                            className="w-full h-56 object-cover" />
                    ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
                            <Package size={40} className="text-emerald-300" />
                        </div>
                    )}
                    {/* Upload overlay for donor/admin */}
                    {(hasRole('DONOR', 'ADMIN')) && (
                        <button onClick={() => setShowUpload(true)}
                            className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all backdrop-blur-sm">
                            <Camera size={13} /> Change Photo
                        </button>
                    )}
                </div>

                <div className="p-6 space-y-5">
                    <div className="flex items-start justify-between gap-3">
                        <h1 className="text-xl font-bold text-gray-900 leading-snug">{donation.foodDescription}</h1>
                        <StatusBadge status={donation.status} size="md" />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <InfoRow icon={Package} label="Quantity" value={`${donation.quantity} units`} />
                        <InfoRow icon={Tag} label="Food Type" value={donation.foodType} />
                        <InfoRow icon={MapPin} label="City" value={donation.city} />
                        <InfoRow icon={MapPin} label="Location" value={donation.location} />
                        <InfoRow icon={Calendar} label="Expiry" value={donation.expiryDate} />
                        <InfoRow icon={Calendar} label="Created" value={donation.createdAt?.split('T')[0]} />
                    </div>

                    {donation.donorId && (
                        <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                            <div className="w-7 h-7 gradient-brand rounded-full flex items-center justify-center shrink-0">
                                <User size={13} className="text-white" />
                            </div>
                            <p className="text-xs text-gray-500">Donor ID: <span className="font-semibold text-gray-700">#{donation.donorId}</span></p>
                        </div>
                    )}
                </div>
            </div>

            {/* Timeline */}
            <Timeline status={donation.status} />

            {/* Admin advance */}
            {hasRole('ADMIN') && !['DELIVERED', 'EXPIRED'].includes(donation.status) && (
                <div className="card p-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="font-semibold text-gray-800 text-sm">Advance Status</p>
                        <p className="text-xs text-gray-400 mt-0.5">Move this donation to the next stage in the workflow</p>
                    </div>
                    <button onClick={() => advance.mutate()} disabled={advance.isPending}
                        className="btn-primary shrink-0 flex items-center gap-2">
                        {advance.isPending
                            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <ChevronRight size={15} />
                        }
                        Advance
                    </button>
                </div>
            )}

            {showUpload && (
                <Modal title="Update Donation Photo" onClose={() => setShowUpload(false)}>
                    <UploadImageModal donationId={id} onClose={() => setShowUpload(false)} />
                </Modal>
            )}
        </div>
    );
}

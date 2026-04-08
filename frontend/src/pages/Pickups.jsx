import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { usePickups, useMarkPicked, useMarkDelivered, useCancelPickup, useUpdatePickup } from '../hooks/usePickups';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/common/Pagination';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Truck, User, Building2, CheckCircle, Clock, Pencil, Trash2 } from 'lucide-react';

/* ── Update Pickup Form ── */
function UpdatePickupForm({ pickup, onClose }) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { volunteerId: pickup.volunteerId, ngoId: pickup.ngoId },
    });
    const updatePickup = useUpdatePickup();

    const onSubmit = async (values) => {
        await updatePickup.mutateAsync({
            id: pickup.pickupId,
            payload: { volunteerId: Number(values.volunteerId), ngoId: Number(values.ngoId) },
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 text-sm">
                <p className="font-semibold text-gray-800">{pickup.donationDescription ?? `Donation #${pickup.donationId}`}</p>
                <p className="text-gray-400 text-xs mt-0.5">Pickup #{pickup.pickupId}</p>
            </div>
            <div>
                <label className="field-label">Volunteer User ID</label>
                <input type="number" {...register('volunteerId', { required: 'Required', min: 1 })} className="field" />
                {errors.volunteerId && <p className="field-error">{errors.volunteerId.message}</p>}
            </div>
            <div>
                <label className="field-label">NGO User ID</label>
                <input type="number" {...register('ngoId', { required: 'Required', min: 1 })} className="field" />
                {errors.ngoId && <p className="field-error">{errors.ngoId.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                    {isSubmitting ? 'Saving…' : 'Update Pickup'}
                </button>
            </div>
        </form>
    );
}

/* ── Pickup Card ── */
function PickupCard({ pickup }) {
    const { hasRole } = useAuth();
    const markPicked = useMarkPicked();
    const markDelivered = useMarkDelivered();
    const cancelPickup = useCancelPickup();
    const [editOpen, setEditOpen] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);

    const { pickupId, donationId, donationDescription, donationStatus, volunteerId, ngoId } = pickup;

    return (
        <>
            <div className="card-hover p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-sm">
                            {donationDescription ?? `Donation #${donationId}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">Pickup #{pickupId}</p>
                    </div>
                    <StatusBadge status={donationStatus} />
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                        <User size={11} className="text-gray-400" /> Volunteer #{volunteerId}
                    </span>
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                        <Building2 size={11} className="text-gray-400" /> NGO #{ngoId}
                    </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {hasRole('VOLUNTEER', 'ADMIN') && donationStatus === 'REQUESTED' && (
                        <button onClick={() => markPicked.mutate(donationId)} disabled={markPicked.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors">
                            <Truck size={11} /> Mark Picked Up
                        </button>
                    )}
                    {hasRole('VOLUNTEER', 'NGO', 'ADMIN') && donationStatus === 'PICKED' && (
                        <button onClick={() => markDelivered.mutate(donationId)} disabled={markDelivered.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-semibold transition-colors">
                            <CheckCircle size={11} /> Mark Delivered
                        </button>
                    )}
                    {donationStatus === 'DELIVERED' && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                            <CheckCircle size={11} /> Delivered
                        </span>
                    )}
                    <div className="ml-auto flex gap-1.5">
                        {hasRole('ADMIN', 'VOLUNTEER') && donationStatus === 'REQUESTED' && (
                            <button onClick={() => setEditOpen(true)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                                <Pencil size={13} />
                            </button>
                        )}
                        {hasRole('ADMIN') && donationStatus === 'REQUESTED' && (
                            <button onClick={() => setConfirmCancel(true)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                                <Trash2 size={13} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {editOpen && (
                <Modal title="Update Pickup" onClose={() => setEditOpen(false)}>
                    <UpdatePickupForm pickup={pickup} onClose={() => setEditOpen(false)} />
                </Modal>
            )}
            {confirmCancel && (
                <ConfirmDialog
                    title="Cancel Pickup"
                    message="This will cancel the pickup and reset the donation to AVAILABLE. This cannot be undone."
                    loading={cancelPickup.isPending}
                    onConfirm={() => cancelPickup.mutate(pickupId, { onSuccess: () => setConfirmCancel(false) })}
                    onCancel={() => setConfirmCancel(false)}
                />
            )}
        </>
    );
}

/* ── Page ── */
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

            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Requested', count: counts.requested, icon: Clock, bg: 'bg-amber-50', ic: 'bg-amber-100 text-amber-600', lbl: 'text-amber-700' },
                    { label: 'Picked Up', count: counts.picked, icon: Truck, bg: 'bg-blue-50', ic: 'bg-blue-100 text-blue-600', lbl: 'text-blue-700' },
                    { label: 'Delivered', count: counts.delivered, icon: CheckCircle, bg: 'bg-emerald-50', ic: 'bg-emerald-100 text-emerald-600', lbl: 'text-emerald-700' },
                ].map(({ label, count, icon: Icon, bg, ic, lbl }) => (
                    <div key={label} className={`${bg} rounded-xl p-4 flex items-center gap-3 border border-white/60`}>
                        <div className={`w-9 h-9 ${ic} rounded-lg flex items-center justify-center shrink-0`}>
                            <Icon size={16} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 tabular-nums">{count}</p>
                            <p className={`text-xs font-semibold ${lbl}`}>{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
                </div>
            ) : pickups.length === 0 ? (
                <EmptyState icon={Truck} title="No pickups yet"
                    sub="Pickup requests appear here once volunteers request them." />
            ) : (
                <div className="space-y-3">
                    {pickups.map(p => <PickupCard key={p.pickupId} pickup={p} />)}
                </div>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
    );
}

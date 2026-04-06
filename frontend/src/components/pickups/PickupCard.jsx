import { Truck, User, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMarkPicked, useMarkDelivered } from '../../hooks/usePickups';

export default function PickupCard({ pickup }) {
    const { hasRole } = useAuth();
    const markPicked = useMarkPicked();
    const markDelivered = useMarkDelivered();

    const { pickupId, donationId, donationDescription, donationStatus, volunteerId, ngoId } = pickup;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-semibold text-gray-900">{donationDescription}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Pickup #{pickupId}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                    {donationStatus}
                </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                    <User size={14} /> Volunteer #{volunteerId}
                </span>
                <span className="flex items-center gap-1">
                    <Building2 size={14} /> NGO #{ngoId}
                </span>
            </div>

            <div className="flex gap-2 pt-1">
                {hasRole('VOLUNTEER') && donationStatus === 'REQUESTED' && (
                    <button
                        onClick={() => markPicked.mutate(donationId)}
                        disabled={markPicked.isPending}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        Mark Picked Up
                    </button>
                )}
                {hasRole('VOLUNTEER', 'NGO') && donationStatus === 'PICKED' && (
                    <button
                        onClick={() => markDelivered.mutate(donationId)}
                        disabled={markDelivered.isPending}
                        className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        Mark Delivered
                    </button>
                )}
            </div>
        </div>
    );
}

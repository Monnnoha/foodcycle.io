import { MapPin, Package, Calendar, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_STYLES = {
    AVAILABLE: 'bg-green-100 text-green-700',
    REQUESTED: 'bg-yellow-100 text-yellow-700',
    PICKED: 'bg-blue-100 text-blue-700',
    DELIVERED: 'bg-gray-100 text-gray-600',
};

export default function DonationCard({ donation, actions }) {
    const {
        donationId, foodDescription, foodType, city, location,
        quantity, status, imageUrl, expiryDate, distanceKm,
    } = donation;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={foodDescription}
                    className="w-full h-40 object-cover"
                />
            )}

            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 leading-tight">{foodDescription}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {status}
                    </span>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    {foodType && (
                        <span className="flex items-center gap-1">
                            <Tag size={14} /> {foodType}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Package size={14} /> {quantity} units
                    </span>
                    {(city || location) && (
                        <span className="flex items-center gap-1">
                            <MapPin size={14} /> {city || location}
                        </span>
                    )}
                    {distanceKm != null && (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                            <MapPin size={14} /> {distanceKm} km away
                        </span>
                    )}
                    {expiryDate && (
                        <span className="flex items-center gap-1">
                            <Calendar size={14} /> Expires {expiryDate}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                    <Link
                        to={`/donations/${donationId}`}
                        className="text-sm text-green-600 hover:underline font-medium"
                    >
                        View details
                    </Link>
                    {actions}
                </div>
            </div>
        </div>
    );
}

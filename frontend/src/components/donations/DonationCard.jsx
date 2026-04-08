import { MapPin, Package, Calendar, Tag, Clock, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';

function isExpiringSoon(d) {
    if (!d) return false;
    const diff = new Date(d) - new Date();
    return diff > 0 && diff < 3 * 86400000;
}

export default function DonationCard({ donation, onRequestPickup }) {
    const { donationId, foodDescription, foodType, city, location, quantity, status, imageUrl, expiryDate, distanceKm } = donation;

    return (
        <div className="card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
            {imageUrl ? (
                <img src={imageUrl} alt={foodDescription} className="w-full h-44 object-cover" />
            ) : (
                <div className="w-full h-44 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                    <Package size={36} className="text-green-300" />
                </div>
            )}

            <div className="p-4 flex flex-col flex-1 gap-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 text-sm">{foodDescription}</h3>
                    <StatusBadge status={status} />
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {foodType && <Chip icon={Tag}>{foodType}</Chip>}
                    <Chip icon={Package}>{quantity} units</Chip>
                    {(city || location) && <Chip icon={MapPin}>{city || location}</Chip>}
                    {distanceKm != null && (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 font-semibold px-2 py-1 rounded-lg">
                            <MapPin size={11} /> {distanceKm} km
                        </span>
                    )}
                </div>

                {expiryDate && (
                    <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium w-fit ${isExpiringSoon(expiryDate) ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
                        {isExpiringSoon(expiryDate) ? <Clock size={11} /> : <Calendar size={11} />}
                        {isExpiringSoon(expiryDate) ? 'Expires soon: ' : ''}{expiryDate}
                    </div>
                )}

                <div className="flex items-center gap-2 mt-auto pt-1">
                    <Link to={`/donations/${donationId}`}
                        className="text-xs font-semibold text-green-600 hover:text-green-700 hover:underline">
                        View details →
                    </Link>
                    {onRequestPickup && (
                        <button onClick={onRequestPickup}
                            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                            <Truck size={12} /> Request Pickup
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function Chip({ icon: Icon, children }) {
    return (
        <span className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded-lg">
            <Icon size={11} />{children}
        </span>
    );
}

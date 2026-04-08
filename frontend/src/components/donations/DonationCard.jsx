import { MapPin, Package, Calendar, Tag, Clock, Truck, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';

function daysUntil(dateStr) {
    if (!dateStr) return null;
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / 86400000);
}

function Chip({ icon: Icon, children, highlight }) {
    return (
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium transition-colors ${highlight
                ? 'bg-green-50 text-green-700 ring-1 ring-green-200/60'
                : 'bg-gray-50 text-gray-500 ring-1 ring-gray-100'
            }`}>
            <Icon size={10} className="shrink-0" />{children}
        </span>
    );
}

export default function DonationCard({ donation, onRequestPickup }) {
    const { donationId, foodDescription, foodType, city, location, quantity, status, imageUrl, expiryDate, distanceKm } = donation;
    const days = daysUntil(expiryDate);
    const expiringSoon = days !== null && days >= 0 && days <= 3;
    const expired = days !== null && days < 0;

    return (
        <div className="group card-interactive overflow-hidden flex flex-col animate-fade-in">
            {/* Image / placeholder */}
            <div className="relative overflow-hidden">
                {imageUrl ? (
                    <img src={imageUrl} alt={foodDescription}
                        className="w-full h-44 object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
                        <div className="w-14 h-14 bg-white/70 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <Package size={26} className="text-emerald-400" />
                        </div>
                    </div>
                )}
                {/* Status overlay */}
                <div className="absolute top-3 right-3">
                    <StatusBadge status={status} />
                </div>
                {/* Expiry warning overlay */}
                {expiringSoon && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                        <Clock size={9} /> {days === 0 ? 'Expires today' : `${days}d left`}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1 gap-2.5">
                <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 text-sm group-hover:text-green-700 transition-colors duration-150">
                    {foodDescription}
                </h3>

                <div className="flex flex-wrap gap-1.5">
                    {foodType && <Chip icon={Tag}>{foodType}</Chip>}
                    <Chip icon={Package}>{quantity} units</Chip>
                    {(city || location) && <Chip icon={MapPin}>{city || location}</Chip>}
                    {distanceKm != null && <Chip icon={MapPin} highlight>{distanceKm} km away</Chip>}
                </div>

                {expiryDate && !expired && (
                    <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium w-fit ${expiringSoon ? 'bg-red-50 text-red-600 ring-1 ring-red-100' : 'bg-gray-50 text-gray-400'
                        }`}>
                        <Calendar size={10} />
                        {expiringSoon ? `Expires in ${days} day${days !== 1 ? 's' : ''}` : `Expires ${expiryDate}`}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-50">
                    <Link to={`/donations/${donationId}`}
                        className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors group/link">
                        View details
                        <ArrowUpRight size={12} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </Link>
                    {onRequestPickup && (
                        <button onClick={onRequestPickup}
                            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all hover:shadow-sm hover:shadow-blue-200 active:scale-95">
                            <Truck size={11} /> Request Pickup
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

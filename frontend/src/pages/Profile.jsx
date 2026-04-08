import { useAuth } from '../context/AuthContext';
import { Mail, Shield, Hash, LogOut, Leaf, User } from 'lucide-react';

const ROLE_INFO = {
    DONOR: { label: 'Food Donor', badge: 'bg-emerald-100 text-emerald-700', desc: 'You share surplus food with the community.' },
    VOLUNTEER: { label: 'Volunteer', badge: 'bg-blue-100 text-blue-700', desc: 'You pick up and deliver food donations.' },
    NGO: { label: 'NGO Partner', badge: 'bg-amber-100 text-amber-700', desc: 'You receive and distribute food to those in need.' },
    ADMIN: { label: 'Administrator', badge: 'bg-purple-100 text-purple-700', desc: 'You manage the entire platform.' },
};

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon size={15} className="text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{value}</p>
            </div>
        </div>
    );
}

export default function Profile() {
    const { user, logout } = useAuth();
    const role = ROLE_INFO[user?.role] ?? ROLE_INFO.DONOR;

    return (
        <div className="max-w-md space-y-5">
            {/* Avatar card */}
            <div className="card p-8 flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 gradient-brand rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-green-200/50">
                    {user?.email?.[0]?.toUpperCase()}
                </div>
                <div>
                    <p className="text-lg font-bold text-gray-900">{user?.email?.split('@')[0]}</p>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${role.badge}`}>{role.label}</span>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">{role.desc}</p>
            </div>

            {/* Details */}
            <div className="card px-5">
                <InfoRow icon={Mail} label="Email address" value={user?.email} />
                <InfoRow icon={Shield} label="Role" value={role.label} />
                <InfoRow icon={Hash} label="User ID" value={user?.id ?? '—'} />
                <InfoRow icon={User} label="Account status" value="Active" />
            </div>

            {/* About */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                    <Leaf size={15} className="text-emerald-600" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-emerald-800">About FoodCycle</p>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                        FoodCycle connects food donors with volunteers and NGOs to reduce waste and feed communities. Every donation makes a difference.
                    </p>
                </div>
            </div>

            <button onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
                <LogOut size={15} /> Sign Out
            </button>
        </div>
    );
}

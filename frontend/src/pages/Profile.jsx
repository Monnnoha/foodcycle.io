import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import {
    Mail, Shield, Hash, LogOut, Leaf, User,
    Phone, Building2, Package, Truck, CheckCircle,
    TrendingUp, MapPin, Star
} from 'lucide-react';

const ROLE_META = {
    DONOR: { label: 'Food Donor', badge: 'bg-emerald-100 text-emerald-700', icon: Package },
    VOLUNTEER: { label: 'Volunteer', badge: 'bg-blue-100 text-blue-700', icon: Truck },
    NGO: { label: 'NGO Partner', badge: 'bg-amber-100 text-amber-700', icon: Building2 },
    ADMIN: { label: 'Administrator', badge: 'bg-purple-100 text-purple-700', icon: Shield },
};

function InfoRow({ icon: Icon, label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-center gap-3 py-3.5 border-b border-gray-50 last:border-0">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon size={14} className="text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{value}</p>
            </div>
        </div>
    );
}

function StatPill({ icon: Icon, label, value, color }) {
    const colors = {
        green: 'bg-emerald-50 text-emerald-700',
        blue: 'bg-blue-50 text-blue-700',
        amber: 'bg-amber-50 text-amber-700',
        purple: 'bg-purple-50 text-purple-700',
    };
    return (
        <div className={`${colors[color]} rounded-xl p-4 flex items-start gap-3`}>
            <Icon size={18} className="mt-0.5 shrink-0" />
            <div>
                <p className="text-xl font-bold tabular-nums">{value ?? '—'}</p>
                <p className="text-xs font-semibold mt-0.5">{label}</p>
            </div>
        </div>
    );
}

/* ── Role-specific stat sections ── */
function DonorStats({ userId }) {
    const { data: s } = useQuery({
        queryKey: ['dashboard', 'donor', userId],
        queryFn: () => dashboardService.getDonorStats(userId),
        enabled: !!userId,
    });
    return (
        <div className="card p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Your Impact</p>
            <div className="grid grid-cols-2 gap-3">
                <StatPill icon={Package} label="Total Donated" value={s?.myDonations} color="green" />
                <StatPill icon={CheckCircle} label="Delivered" value={s?.completedDonations} color="purple" />
                <StatPill icon={Truck} label="In Progress" value={s?.pendingPickups} color="amber" />
                <StatPill icon={TrendingUp} label="Available" value={s?.availableDonations} color="blue" />
            </div>
        </div>
    );
}

function VolunteerStats({ userId }) {
    const { data: s } = useQuery({
        queryKey: ['dashboard', 'volunteer', userId],
        queryFn: () => dashboardService.getVolunteerStats(userId),
        enabled: !!userId,
    });
    return (
        <div className="card p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pickup Stats</p>
            <div className="grid grid-cols-3 gap-3">
                <StatPill icon={Package} label="Assigned" value={s?.totalAssigned} color="blue" />
                <StatPill icon={Truck} label="Active" value={s?.activePickups} color="amber" />
                <StatPill icon={CheckCircle} label="Completed" value={s?.completedPickups} color="green" />
            </div>
        </div>
    );
}

function NGOStats() {
    const { data: s } = useQuery({
        queryKey: ['dashboard', 'admin'],
        queryFn: dashboardService.getAdminStats,
    });
    return (
        <div className="card p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Platform Stats</p>
            <div className="grid grid-cols-2 gap-3">
                <StatPill icon={Package} label="Total Donations" value={s?.totalDonations} color="green" />
                <StatPill icon={CheckCircle} label="Delivered" value={s?.completedDeliveries} color="purple" />
            </div>
        </div>
    );
}

export default function Profile() {
    const { user, logout } = useAuth();
    const meta = ROLE_META[user?.role] ?? ROLE_META.DONOR;
    const RoleIcon = meta.icon;

    return (
        <div className="max-w-lg space-y-5">
            {/* Avatar hero */}
            <div className="card p-7 flex flex-col items-center text-center gap-4 relative overflow-hidden">
                <div className="absolute inset-0 gradient-brand-soft opacity-40 pointer-events-none" />
                <div className="relative">
                    <div className="w-20 h-20 gradient-brand rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-green-200/50 ring-4 ring-white">
                        {(user?.name || user?.email)?.[0]?.toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <RoleIcon size={13} className="text-gray-600" />
                    </div>
                </div>
                <div>
                    <p className="text-lg font-bold text-gray-900">{user?.name || user?.email?.split('@')[0]}</p>
                    {user?.orgName && <p className="text-sm text-gray-500 font-medium">{user.orgName}</p>}
                    <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${meta.badge}`}>{meta.label}</span>
            </div>

            {/* Role-specific stats */}
            {user?.role === 'DONOR' && <DonorStats userId={user.id} />}
            {user?.role === 'VOLUNTEER' && <VolunteerStats userId={user.id} />}
            {user?.role === 'NGO' && <NGOStats />}

            {/* Account details */}
            <div className="card px-5">
                <InfoRow icon={User} label="Full Name" value={user?.name} />
                <InfoRow icon={Mail} label="Email" value={user?.email} />
                <InfoRow icon={Building2} label="Organization" value={user?.orgName} />
                <InfoRow icon={Shield} label="Role" value={meta.label} />
                <InfoRow icon={Hash} label="User ID" value={user?.id ? `#${user.id}` : null} />
            </div>

            {/* NGO verification notice */}
            {user?.role === 'NGO' && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                    <Star size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800">Verification Status</p>
                        <p className="text-xs text-amber-700 mt-1">Your NGO account is active. Contact admin for official verification badge.</p>
                    </div>
                </div>
            )}

            {/* About */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                    <Leaf size={14} className="text-emerald-600" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-emerald-800">About FoodCycle</p>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                        Connecting food donors, volunteers, and NGOs to eliminate food waste and fight hunger.
                    </p>
                </div>
            </div>

            <button onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
                <LogOut size={14} /> Sign Out
            </button>
        </div>
    );
}

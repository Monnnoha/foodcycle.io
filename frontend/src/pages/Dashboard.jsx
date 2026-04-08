import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import {
    Package, Truck, CheckCircle, Clock, Users,
    TrendingUp, Leaf, ArrowRight, Plus, MapPin
} from 'lucide-react';

/* ── Skeleton ── */
function SkeletonCards({ n = 4 }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(n)].map((_, i) => (
                <div key={i} className="card p-5 space-y-3">
                    <div className="skeleton h-10 w-10 rounded-lg" />
                    <div className="skeleton h-6 w-16" />
                    <div className="skeleton h-3 w-24" />
                </div>
            ))}
        </div>
    );
}

/* ── Stat Card ── */
const STAT_COLORS = {
    green: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', val: 'text-gray-900', lbl: 'text-emerald-700' },
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', val: 'text-gray-900', lbl: 'text-blue-700' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', val: 'text-gray-900', lbl: 'text-amber-700' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', val: 'text-gray-900', lbl: 'text-purple-700' },
};

function StatCard({ label, value, icon: Icon, color = 'green', sub }) {
    const c = STAT_COLORS[color];
    return (
        <div className={`${c.bg} rounded-xl p-5 flex items-start gap-4 border border-white/60`}>
            <div className={`${c.icon} w-10 h-10 rounded-lg flex items-center justify-center shrink-0`}>
                <Icon size={18} />
            </div>
            <div className="min-w-0">
                <p className={`text-2xl font-bold ${c.val} tabular-nums`}>{value ?? <span className="text-gray-300">—</span>}</p>
                <p className={`text-xs font-semibold ${c.lbl} mt-0.5`}>{label}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

/* ── Quick Action ── */
function QuickAction({ to, icon: Icon, label, sub, iconBg, iconColor }) {
    return (
        <Link to={to} className="group flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/80 transition-all">
            <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon size={17} className={iconColor} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 truncate">{sub}</p>
            </div>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
        </Link>
    );
}

/* ── Progress Bar ── */
function ProgressBar({ label, value, total, color }) {
    const pct = total ? Math.round((value / total) * 100) : 0;
    return (
        <div>
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-gray-600">{label}</span>
                <span className="text-xs text-gray-400 tabular-nums">{value ?? 0} <span className="text-gray-300">/ {total ?? 0}</span></span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

/* ── DONOR ── */
function DonorDashboard({ user }) {
    const { data: s, isLoading } = useQuery({
        queryKey: ['dashboard', 'donor', user?.id],
        queryFn: () => dashboardService.getDonorStats(user?.id),
        enabled: !!user?.id,
    });

    return (
        <div className="space-y-6">
            {/* Hero */}
            <div className="gradient-brand rounded-xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-1">
                        <Leaf size={18} className="text-green-200" />
                        <span className="text-green-200 text-xs font-semibold uppercase tracking-wide">Donor Dashboard</span>
                    </div>
                    <h1 className="text-2xl font-bold">Welcome back, {user?.email?.split('@')[0]}!</h1>
                    <p className="text-green-100 text-sm mt-1">Your generosity is feeding communities. Keep it up.</p>
                    <Link to="/donations" className="inline-flex items-center gap-1.5 mt-4 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                        <Plus size={13} /> New Donation
                    </Link>
                </div>
            </div>

            {/* Stats */}
            {isLoading ? <SkeletonCards /> : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Total Donated" value={s?.myDonations} icon={Package} color="green" sub="All time" />
                    <StatCard label="Available" value={s?.availableDonations} icon={Clock} color="blue" sub="Awaiting pickup" />
                    <StatCard label="In Progress" value={s?.pendingPickups} icon={Truck} color="amber" sub="Being collected" />
                    <StatCard label="Delivered" value={s?.completedDonations} icon={CheckCircle} color="purple" sub="Successfully done" />
                </div>
            )}

            {/* Quick actions */}
            <div className="card p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <QuickAction to="/donations" icon={Package} label="My Donations" sub="View and manage your donations" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
                    <QuickAction to="/notifications" icon={Clock} label="Notifications" sub="Check pickup updates" iconBg="bg-blue-100" iconColor="text-blue-600" />
                </div>
            </div>
        </div>
    );
}

/* ── VOLUNTEER ── */
function VolunteerDashboard({ user }) {
    const { data: s, isLoading } = useQuery({
        queryKey: ['dashboard', 'volunteer', user?.id],
        queryFn: () => dashboardService.getVolunteerStats(user?.id),
        enabled: !!user?.id,
    });

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-1">
                        <Truck size={18} className="text-blue-200" />
                        <span className="text-blue-200 text-xs font-semibold uppercase tracking-wide">Volunteer Hub</span>
                    </div>
                    <h1 className="text-2xl font-bold">Ready to deliver?</h1>
                    <p className="text-blue-100 text-sm mt-1">Every delivery you make feeds a family. Thank you.</p>
                    <Link to="/nearby" className="inline-flex items-center gap-1.5 mt-4 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                        <MapPin size={13} /> Find Nearby Donations
                    </Link>
                </div>
            </div>

            {isLoading ? <SkeletonCards n={3} /> : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <StatCard label="Total Assigned" value={s?.totalAssigned} icon={Package} color="blue" sub="All pickups" />
                    <StatCard label="Active Pickups" value={s?.activePickups} icon={Truck} color="amber" sub="In progress" />
                    <StatCard label="Completed" value={s?.completedPickups} icon={CheckCircle} color="green" sub="Delivered" />
                </div>
            )}

            <div className="card p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <QuickAction to="/donations" icon={Package} label="Browse Donations" sub="Find available food to pick up" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
                    <QuickAction to="/pickups" icon={Truck} label="My Pickups" sub="Manage your active pickups" iconBg="bg-blue-100" iconColor="text-blue-600" />
                    <QuickAction to="/nearby" icon={MapPin} label="Nearby Search" sub="Find donations near you" iconBg="bg-amber-100" iconColor="text-amber-600" />
                </div>
            </div>
        </div>
    );
}

/* ── ADMIN / NGO ── */
function AdminDashboard() {
    const { data: s, isLoading } = useQuery({
        queryKey: ['dashboard', 'admin'],
        queryFn: dashboardService.getAdminStats,
    });

    const breakdown = [
        { label: 'Available', value: s?.availableDonations, color: 'bg-emerald-500' },
        { label: 'Requested', value: s?.requestedDonations, color: 'bg-amber-500' },
        { label: 'Picked', value: s?.pickedDonations, color: 'bg-blue-500' },
        { label: 'Delivered', value: s?.completedDeliveries, color: 'bg-purple-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={18} className="text-slate-400" />
                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Platform Overview</span>
                    </div>
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <p className="text-slate-300 text-sm mt-1">Real-time insights across the food redistribution network.</p>
                </div>
            </div>

            {isLoading ? <SkeletonCards /> : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Total Users" value={s?.totalUsers} icon={Users} color="purple" />
                    <StatCard label="Total Donations" value={s?.totalDonations} icon={Package} color="green" />
                    <StatCard label="Active Pickups" value={s?.activePickups} icon={Truck} color="amber" />
                    <StatCard label="Delivered" value={s?.completedDeliveries} icon={CheckCircle} color="blue" />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Quick actions */}
                <div className="card p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
                    <div className="space-y-1.5">
                        <QuickAction to="/donations" icon={Package} label="Manage Donations" sub="View, filter and advance statuses" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
                        <QuickAction to="/pickups" icon={Truck} label="Manage Pickups" sub="Oversee all pickup operations" iconBg="bg-blue-100" iconColor="text-blue-600" />
                        <QuickAction to="/users" icon={Users} label="Manage Users" sub="View all registered users" iconBg="bg-purple-100" iconColor="text-purple-600" />
                    </div>
                </div>

                {/* Status breakdown */}
                <div className="card p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Donation Breakdown</p>
                    {isLoading ? (
                        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-4 rounded" />)}</div>
                    ) : (
                        <div className="space-y-4">
                            {breakdown.map(b => (
                                <ProgressBar key={b.label} label={b.label} value={b.value} total={s?.totalDonations} color={b.color} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { user, hasRole } = useAuth();
    if (hasRole('ADMIN', 'NGO')) return <AdminDashboard />;
    if (hasRole('VOLUNTEER')) return <VolunteerDashboard user={user} />;
    return <DonorDashboard user={user} />;
}

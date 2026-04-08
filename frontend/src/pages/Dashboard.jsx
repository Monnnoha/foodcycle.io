import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import {
    Package, Truck, CheckCircle, Clock, Users,
    TrendingUp, Leaf, ArrowRight, Plus, MapPin, Activity
} from 'lucide-react';

/* ── Skeleton ── */
function SkeletonCards({ n = 4 }) {
    return (
        <div className={`grid gap-3 ${n === 3 ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
            {[...Array(n)].map((_, i) => (
                <div key={i} className="card p-5 space-y-3 animate-pulse">
                    <div className="skeleton h-9 w-9 rounded-lg" />
                    <div className="skeleton h-7 w-14 rounded" />
                    <div className="skeleton h-3 w-20 rounded" />
                </div>
            ))}
        </div>
    );
}

/* ── Stat Card ── */
const STAT_COLORS = {
    green: { bg: 'bg-emerald-50', ring: 'ring-emerald-100', icon: 'bg-emerald-100 text-emerald-600', lbl: 'text-emerald-700' },
    blue: { bg: 'bg-blue-50', ring: 'ring-blue-100', icon: 'bg-blue-100 text-blue-600', lbl: 'text-blue-700' },
    amber: { bg: 'bg-amber-50', ring: 'ring-amber-100', icon: 'bg-amber-100 text-amber-600', lbl: 'text-amber-700' },
    purple: { bg: 'bg-purple-50', ring: 'ring-purple-100', icon: 'bg-purple-100 text-purple-600', lbl: 'text-purple-700' },
};

function StatCard({ label, value, icon: Icon, color = 'green', sub }) {
    const c = STAT_COLORS[color];
    return (
        <div className={`${c.bg} ring-1 ${c.ring} rounded-xl p-5 flex items-start gap-3.5 hover:shadow-sm transition-shadow duration-200`}>
            <div className={`${c.icon} w-9 h-9 rounded-lg flex items-center justify-center shrink-0`}>
                <Icon size={17} />
            </div>
            <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none">
                    {value ?? <span className="text-gray-200 text-xl">—</span>}
                </p>
                <p className={`text-xs font-semibold ${c.lbl} mt-1`}>{label}</p>
                {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

/* ── Quick Action ── */
function QuickAction({ to, icon: Icon, label, sub, iconBg, iconColor }) {
    return (
        <Link to={to}
            className="group flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/60 transition-all duration-150 active:scale-[0.99]">
            <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={15} className={iconColor} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{label}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{sub}</p>
            </div>
            <ArrowRight size={13} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
    );
}

/* ── Progress Bar ── */
function ProgressBar({ label, value, total, color }) {
    const pct = total ? Math.round(((value ?? 0) / total) * 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-600">{label}</span>
                <span className="text-xs text-gray-400 tabular-nums">{value ?? 0}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

/* ── Hero Banner ── */
function HeroBanner({ gradient, badge, badgeIcon: BadgeIcon, title, sub, cta }) {
    return (
        <div className={`${gradient} hero-banner text-white`}>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <BadgeIcon size={15} className="opacity-70" />
                    <span className="text-[11px] font-bold uppercase tracking-widest opacity-70">{badge}</span>
                </div>
                <h1 className="text-2xl font-bold leading-tight">{title}</h1>
                <p className="text-sm mt-1.5 opacity-80 max-w-md">{sub}</p>
                {cta && (
                    <Link to={cta.to}
                        className="inline-flex items-center gap-1.5 mt-4 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all hover:shadow-sm active:scale-95">
                        {cta.icon && <cta.icon size={13} />} {cta.label}
                    </Link>
                )}
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
        <div className="space-y-5 animate-slide-up">
            <HeroBanner
                gradient="gradient-brand"
                badge="Donor Dashboard"
                badgeIcon={Leaf}
                title={`Welcome back, ${user?.email?.split('@')[0]}!`}
                sub="Your generosity is feeding communities. Every donation counts."
                cta={{ to: '/donations', icon: Plus, label: 'Create New Donation' }}
            />

            {isLoading ? <SkeletonCards /> : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Total Donated" value={s?.myDonations} icon={Package} color="green" sub="All time" />
                    <StatCard label="Available" value={s?.availableDonations} icon={Clock} color="blue" sub="Awaiting pickup" />
                    <StatCard label="In Progress" value={s?.pendingPickups} icon={Truck} color="amber" sub="Being collected" />
                    <StatCard label="Delivered" value={s?.completedDonations} icon={CheckCircle} color="purple" sub="Successfully done" />
                </div>
            )}

            <div className="card p-5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <QuickAction to="/donations" icon={Package} label="All Donations" sub="Browse and manage donations" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
                    <QuickAction to="/my-donations" icon={Activity} label="My Donations" sub="Track your donation history" iconBg="bg-blue-100" iconColor="text-blue-600" />
                    <QuickAction to="/notifications" icon={Clock} label="Notifications" sub="Check pickup status updates" iconBg="bg-amber-100" iconColor="text-amber-600" />
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
        <div className="space-y-5 animate-slide-up">
            <HeroBanner
                gradient="gradient-blue"
                badge="Volunteer Hub"
                badgeIcon={Truck}
                title="Ready to make a delivery?"
                sub="Every pickup you complete puts food on someone's table. Thank you."
                cta={{ to: '/nearby', icon: MapPin, label: 'Find Nearby Donations' }}
            />

            {isLoading ? <SkeletonCards n={3} /> : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <StatCard label="Total Assigned" value={s?.totalAssigned} icon={Package} color="blue" sub="All pickups" />
                    <StatCard label="Active Pickups" value={s?.activePickups} icon={Truck} color="amber" sub="In progress" />
                    <StatCard label="Completed" value={s?.completedPickups} icon={CheckCircle} color="green" sub="Delivered" />
                </div>
            )}

            <div className="card p-5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <QuickAction to="/donations" icon={Package} label="Browse Donations" sub="Find available food to pick up" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
                    <QuickAction to="/pickups" icon={Truck} label="My Pickups" sub="Manage your active pickups" iconBg="bg-blue-100" iconColor="text-blue-600" />
                    <QuickAction to="/nearby" icon={MapPin} label="Nearby Search" sub="Find donations close to you" iconBg="bg-amber-100" iconColor="text-amber-600" />
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
        <div className="space-y-5 animate-slide-up">
            <HeroBanner
                gradient="gradient-slate"
                badge="Platform Overview"
                badgeIcon={TrendingUp}
                title="Admin Dashboard"
                sub="Real-time insights across the entire food redistribution network."
            />

            {isLoading ? <SkeletonCards /> : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Total Users" value={s?.totalUsers} icon={Users} color="purple" />
                    <StatCard label="Total Donations" value={s?.totalDonations} icon={Package} color="green" />
                    <StatCard label="Active Pickups" value={s?.activePickups} icon={Truck} color="amber" />
                    <StatCard label="Delivered" value={s?.completedDeliveries} icon={CheckCircle} color="blue" />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card p-5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
                    <div className="space-y-1.5">
                        <QuickAction to="/donations" icon={Package} label="Manage Donations" sub="View, filter and advance statuses" iconBg="bg-emerald-100" iconColor="text-emerald-600" />
                        <QuickAction to="/pickups" icon={Truck} label="Manage Pickups" sub="Oversee all pickup operations" iconBg="bg-blue-100" iconColor="text-blue-600" />
                        <QuickAction to="/users" icon={Users} label="Manage Users" sub="View all registered users" iconBg="bg-purple-100" iconColor="text-purple-600" />
                        <QuickAction to="/audit-logs" icon={Activity} label="Audit Logs" sub="Full platform activity trail" iconBg="bg-slate-100" iconColor="text-slate-600" />
                    </div>
                </div>

                <div className="card p-5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Donation Pipeline</p>
                    {isLoading ? (
                        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-4 rounded" />)}</div>
                    ) : (
                        <div className="space-y-4">
                            {breakdown.map(b => (
                                <ProgressBar key={b.label} label={b.label} value={b.value} total={s?.totalDonations} color={b.color} />
                            ))}
                            <div className="pt-2 border-t border-gray-50 flex justify-between text-xs text-gray-400">
                                <span>Total donations</span>
                                <span className="font-semibold text-gray-600 tabular-nums">{s?.totalDonations ?? 0}</span>
                            </div>
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

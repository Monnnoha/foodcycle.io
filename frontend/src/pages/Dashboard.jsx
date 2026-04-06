import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';

function StatCard({ label, value, color = 'green' }) {
    const colors = {
        green: 'bg-green-50 text-green-700',
        blue: 'bg-blue-50 text-blue-700',
        amber: 'bg-amber-50 text-amber-700',
        gray: 'bg-gray-50 text-gray-600',
    };
    return (
        <div className={`rounded-xl p-5 ${colors[color]}`}>
            <p className="text-3xl font-bold">{value ?? '—'}</p>
            <p className="text-sm mt-1 font-medium">{label}</p>
        </div>
    );
}

export default function Dashboard() {
    const { user, hasRole } = useAuth();

    const adminQuery = useQuery({
        queryKey: ['dashboard', 'admin'],
        queryFn: dashboardService.getAdminStats,
        enabled: hasRole('ADMIN', 'NGO'),
    });

    const donorQuery = useQuery({
        queryKey: ['dashboard', 'donor'],
        queryFn: () => dashboardService.getDonorStats(user?.id),
        enabled: hasRole('DONOR') && !!user?.id,
    });

    const volunteerQuery = useQuery({
        queryKey: ['dashboard', 'volunteer'],
        queryFn: () => dashboardService.getVolunteerStats(user?.id),
        enabled: hasRole('VOLUNTEER') && !!user?.id,
    });

    if (hasRole('ADMIN', 'NGO')) {
        const s = adminQuery.data;
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Total Users" value={s?.totalUsers} color="blue" />
                    <StatCard label="Total Donations" value={s?.totalDonations} color="green" />
                    <StatCard label="Active Pickups" value={s?.activePickups} color="amber" />
                    <StatCard label="Delivered" value={s?.completedDeliveries} color="gray" />
                </div>
            </div>
        );
    }

    if (hasRole('DONOR')) {
        const s = donorQuery.data;
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Total Donated" value={s?.myDonations} color="green" />
                    <StatCard label="Available" value={s?.availableDonations} color="blue" />
                    <StatCard label="Pending Pickup" value={s?.pendingPickups} color="amber" />
                    <StatCard label="Delivered" value={s?.completedDonations} color="gray" />
                </div>
            </div>
        );
    }

    if (hasRole('VOLUNTEER')) {
        const s = volunteerQuery.data;
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">My Pickups</h1>
                <div className="grid grid-cols-3 gap-4">
                    <StatCard label="Total Assigned" value={s?.totalAssigned} color="blue" />
                    <StatCard label="Active" value={s?.activePickups} color="amber" />
                    <StatCard label="Completed" value={s?.completedPickups} color="green" />
                </div>
            </div>
        );
    }

    return <p className="text-gray-500">Welcome to FoodCycle.</p>;
}

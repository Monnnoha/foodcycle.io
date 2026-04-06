import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Truck, User, Users, BarChart2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItem = 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors';
const active = 'bg-green-50 text-green-700';
const inactive = 'text-gray-600 hover:bg-gray-100';

export default function Sidebar() {
    const { hasRole } = useAuth();

    return (
        <aside className="w-56 min-h-screen bg-white border-r border-gray-200 pt-6 px-3 flex flex-col gap-1">
            <NavLink to="/dashboard" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
                <LayoutDashboard size={18} /> Dashboard
            </NavLink>

            <NavLink to="/donations" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
                <Package size={18} /> Donations
            </NavLink>

            {hasRole('VOLUNTEER', 'NGO', 'ADMIN') && (
                <NavLink to="/pickups" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
                    <Truck size={18} /> Pickups
                </NavLink>
            )}

            {hasRole('ADMIN') && (
                <NavLink to="/users" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
                    <Users size={18} /> Users
                </NavLink>
            )}

            <NavLink to="/profile" className={({ isActive }) => `${navItem} ${isActive ? active : inactive}`}>
                <User size={18} /> Profile
            </NavLink>
        </aside>
    );
}

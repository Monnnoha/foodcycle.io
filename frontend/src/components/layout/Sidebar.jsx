import { NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard, Package, Truck, Users, User,
    Bell, MapPin, Leaf, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';

const ROLE_BADGE = {
    ADMIN: 'bg-purple-100 text-purple-700',
    DONOR: 'bg-emerald-100 text-emerald-700',
    VOLUNTEER: 'bg-blue-100 text-blue-700',
    NGO: 'bg-amber-100 text-amber-700',
};

export default function Sidebar() {
    const { hasRole, user, logout } = useAuth();

    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: notificationService.getUnreadCount,
        refetchInterval: 30_000,
        enabled: !!user,
    });

    const sections = [
        {
            title: 'Main',
            links: [
                { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { to: '/donations', icon: Package, label: 'Donations' },
            ],
        },
        {
            title: 'Operations',
            roles: ['VOLUNTEER', 'NGO', 'ADMIN'],
            links: [
                { to: '/nearby', icon: MapPin, label: 'Nearby', roles: ['VOLUNTEER', 'NGO', 'ADMIN'] },
                { to: '/pickups', icon: Truck, label: 'Pickups', roles: ['VOLUNTEER', 'NGO', 'ADMIN'] },
            ],
        },
        {
            title: 'Admin',
            roles: ['ADMIN'],
            links: [
                { to: '/users', icon: Users, label: 'Users', roles: ['ADMIN'] },
            ],
        },
        {
            title: 'Account',
            links: [
                { to: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
                { to: '/profile', icon: User, label: 'Profile' },
            ],
        },
    ];

    return (
        <aside className="w-[220px] shrink-0 h-screen bg-white border-r border-gray-200/80 flex flex-col">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2.5 px-5 h-14 border-b border-gray-100 shrink-0">
                <div className="w-7 h-7 gradient-brand rounded-lg flex items-center justify-center shadow-sm">
                    <Leaf size={14} className="text-white" />
                </div>
                <span className="text-base font-bold text-gray-900 tracking-tight">FoodCycle</span>
            </Link>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                {sections.map(section => {
                    if (section.roles && !hasRole(...section.roles)) return null;
                    const visibleLinks = section.links.filter(l => !l.roles || hasRole(...l.roles));
                    if (!visibleLinks.length) return null;
                    return (
                        <div key={section.title}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1.5">
                                {section.title}
                            </p>
                            <div className="space-y-0.5">
                                {visibleLinks.map(({ to, icon: Icon, label, badge }) => (
                                    <NavLink key={to} to={to}
                                        className={({ isActive }) =>
                                            `group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-100 ${isActive
                                                ? 'bg-green-600 text-white shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`
                                        }>
                                        {({ isActive }) => (
                                            <>
                                                <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
                                                <span className="flex-1">{label}</span>
                                                {badge > 0 && (
                                                    <span className={`text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ${isActive ? 'bg-white/30 text-white' : 'bg-red-500 text-white'}`}>
                                                        {badge > 9 ? '9+' : badge}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* User footer */}
            <div className="px-3 py-3 border-t border-gray-100 shrink-0">
                <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="w-7 h-7 gradient-brand rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {user?.email?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{user?.email?.split('@')[0]}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${ROLE_BADGE[user?.role] ?? 'bg-gray-100 text-gray-600'}`}>
                            {user?.role}
                        </span>
                    </div>
                    <ChevronRight size={13} className="text-gray-400 shrink-0" />
                </div>
            </div>
        </aside>
    );
}

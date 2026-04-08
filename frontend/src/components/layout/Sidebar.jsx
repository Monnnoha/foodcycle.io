import { NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard, Package, Truck, Users, User,
    Bell, MapPin, Leaf, ChevronRight, Shield, BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';
import { ROLE_STYLES } from '../../lib/constants';

const SECTIONS = [
    {
        title: 'Overview',
        links: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
    },
    {
        title: 'Donations',
        links: [
            { to: '/donations', icon: Package, label: 'All Donations' },
            { to: '/my-donations', icon: BookOpen, label: 'My Donations', roles: ['DONOR'] },
            { to: '/nearby', icon: MapPin, label: 'Nearby', roles: ['VOLUNTEER', 'NGO', 'ADMIN'] },
        ],
    },
    {
        title: 'Operations',
        links: [
            { to: '/pickups', icon: Truck, label: 'Pickups', roles: ['VOLUNTEER', 'NGO', 'ADMIN'] },
        ],
    },
    {
        title: 'Admin',
        roles: ['ADMIN'],
        links: [
            { to: '/users', icon: Users, label: 'Users', roles: ['ADMIN'] },
            { to: '/audit-logs', icon: Shield, label: 'Audit Logs', roles: ['ADMIN'] },
        ],
    },
    {
        title: 'Account',
        links: [
            { to: '/notifications', icon: Bell, label: 'Notifications' },
            { to: '/profile', icon: User, label: 'Profile' },
        ],
    },
];

function NavItem({ to, icon: Icon, label, badge }) {
    return (
        <NavLink to={to}
            className={({ isActive }) =>
                `group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${isActive
                    ? 'bg-green-600 text-white shadow-sm shadow-green-300/40'
                    : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                }`
            }>
            {({ isActive }) => (
                <>
                    <Icon size={15} className={`shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="flex-1 truncate">{label}</span>
                    {badge > 0 && (
                        <span className={`text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shrink-0 ${isActive ? 'bg-white/25 text-white' : 'bg-red-500 text-white'
                            }`}>
                            {badge > 9 ? '9+' : badge}
                        </span>
                    )}
                </>
            )}
        </NavLink>
    );
}

export default function Sidebar() {
    const { hasRole, user } = useAuth();

    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: notificationService.getUnreadCount,
        refetchInterval: 30_000,
        enabled: !!user,
    });

    return (
        <aside className="w-[220px] shrink-0 h-screen bg-white border-r border-gray-200/60 flex flex-col overflow-hidden">
            {/* Logo */}
            <Link to="/dashboard"
                className="flex items-center gap-3 px-4 h-[57px] border-b border-gray-100 shrink-0 hover:bg-gray-50/50 transition-colors">
                <div className="w-7 h-7 gradient-brand rounded-lg flex items-center justify-center shadow-sm shadow-green-300/30 shrink-0">
                    <Leaf size={13} className="text-white" />
                </div>
                <div>
                    <span className="text-sm font-bold text-gray-900 tracking-tight">FoodCycle</span>
                    <span className="block text-[9px] text-gray-400 font-medium -mt-0.5 tracking-wide">PLATFORM</span>
                </div>
            </Link>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5">
                {SECTIONS.map(section => {
                    if (section.roles && !hasRole(...section.roles)) return null;
                    const visible = section.links.filter(l => !l.roles || hasRole(...l.roles));
                    if (!visible.length) return null;
                    return (
                        <div key={section.title}>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.1em] px-3 mb-1.5">
                                {section.title}
                            </p>
                            <div className="space-y-0.5">
                                {visible.map(link => (
                                    <NavItem key={link.to} {...link}
                                        badge={link.to === '/notifications' ? unreadCount : 0} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* User footer */}
            <Link to="/profile"
                className="group flex items-center gap-2.5 px-3 py-3.5 border-t border-gray-100 hover:bg-gray-50 transition-colors shrink-0">
                <div className="w-8 h-8 gradient-brand rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm shadow-green-300/30 ring-2 ring-white">
                    {user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{user?.email?.split('@')[0]}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${ROLE_STYLES[user?.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {user?.role}
                    </span>
                </div>
                <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
        </aside>
    );
}

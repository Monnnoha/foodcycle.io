import { Link, useLocation } from 'react-router-dom';
import { Bell, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../hooks/useTheme';

const ROUTE_META = {
    '/dashboard': { title: 'Dashboard', emoji: '🏠' },
    '/donations': { title: 'Donations', emoji: '📦' },
    '/my-donations': { title: 'My Donations', emoji: '📋' },
    '/nearby': { title: 'Nearby Donations', emoji: '📍' },
    '/pickups': { title: 'Pickups', emoji: '🚚' },
    '/users': { title: 'User Management', emoji: '👥' },
    '/audit-logs': { title: 'Audit Logs', emoji: '🔍' },
    '/notifications': { title: 'Notifications', emoji: '🔔' },
    '/profile': { title: 'Profile', emoji: '👤' },
};

export default function Navbar() {
    const { user, logout } = useAuth();
    const { pathname } = useLocation();
    const { dark, toggle } = useTheme();

    // Match dynamic routes like /donations/:id
    const baseRoute = '/' + pathname.split('/')[1];
    const meta = ROUTE_META[pathname] ?? ROUTE_META[baseRoute] ?? { title: 'FoodCycle', emoji: '🌿' };
    const isDonationDetail = pathname.startsWith('/donations/') && pathname !== '/donations';

    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: notificationService.getUnreadCount,
        refetchInterval: 30_000,
        enabled: !!user,
    });

    return (
        <header className="h-[57px] bg-white/90 backdrop-blur-sm border-b border-gray-200/60 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 min-w-0">
                {isDonationDetail && (
                    <>
                        <Link to="/donations" className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium">
                            Donations
                        </Link>
                        <span className="text-gray-300 text-xs">/</span>
                    </>
                )}
                <h1 className="text-sm font-semibold text-gray-900 truncate">{meta.title}</h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
                {/* Dark mode toggle */}
                <button onClick={toggle}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all duration-150 active:scale-95"
                    aria-label="Toggle dark mode">
                    {dark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <Link to="/notifications"
                    className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all duration-150 active:scale-95">
                    <Bell size={16} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center animate-scale-in">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Link>

                <div className="w-px h-4 bg-gray-200 mx-1" />

                <button onClick={logout}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all duration-150 font-medium active:scale-95">
                    <LogOut size={13} />
                    <span className="hidden sm:block">Sign out</span>
                </button>
            </div>
        </header>
    );
}

import { Link, useLocation } from 'react-router-dom';
import { Bell, LogOut, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';

const ROUTE_TITLES = {
    '/dashboard': 'Dashboard',
    '/donations': 'Donations',
    '/nearby': 'Nearby Donations',
    '/pickups': 'Pickups',
    '/users': 'User Management',
    '/notifications': 'Notifications',
    '/profile': 'Profile',
};

export default function Navbar() {
    const { user, logout } = useAuth();
    const { pathname } = useLocation();
    const title = ROUTE_TITLES[pathname] ?? 'FoodCycle';

    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: notificationService.getUnreadCount,
        refetchInterval: 30_000,
        enabled: !!user,
    });

    return (
        <header className="h-14 bg-white border-b border-gray-200/80 flex items-center justify-between px-6 shrink-0">
            <h1 className="text-sm font-semibold text-gray-900">{title}</h1>

            <div className="flex items-center gap-1">
                <Link to="/notifications"
                    className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                    <Bell size={17} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Link>

                <button onClick={logout}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors ml-1 font-medium">
                    <LogOut size={14} />
                    <span className="hidden sm:block">Sign out</span>
                </button>
            </div>
        </header>
    );
}

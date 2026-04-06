import { Link } from 'react-router-dom';
import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';

export default function Navbar() {
    const { user, logout } = useAuth();

    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: notificationService.getUnreadCount,
        refetchInterval: 30_000, // poll every 30s
        enabled: !!user,
    });

    return (
        <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
            <Link to="/dashboard" className="text-xl font-bold text-green-600">
                FoodCycle
            </Link>

            <div className="flex items-center gap-4">
                <Link to="/notifications" className="relative p-2 text-gray-500 hover:text-gray-700">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Link>

                <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                    <User size={18} />
                    <span className="hidden sm:block">{user?.email}</span>
                </Link>

                <button
                    onClick={logout}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
                >
                    <LogOut size={18} />
                    <span className="hidden sm:block">Logout</span>
                </button>
            </div>
        </nav>
    );
}

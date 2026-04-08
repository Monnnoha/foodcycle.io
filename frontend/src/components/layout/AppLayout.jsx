import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout() {
    const { isAuthenticated } = useAuth();
    const { pathname } = useLocation();

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return (
        <div className="flex h-screen bg-[#f7f8fa] overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0">
                <Navbar />
                <main className="flex-1 overflow-y-auto">
                    <div key={pathname} className="max-w-6xl mx-auto px-6 py-6 animate-slide-up">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

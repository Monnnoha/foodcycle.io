import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout() {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return (
        <div className="flex h-screen bg-[#f8f9fb] overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0">
                <Navbar />
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

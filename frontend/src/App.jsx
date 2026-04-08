import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

// Eager load auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy load all app pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Donations = lazy(() => import('./pages/Donations'));
const DonationDetail = lazy(() => import('./pages/DonationDetail'));
const Pickups = lazy(() => import('./pages/Pickups'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));
const Users = lazy(() => import('./pages/Users'));
const NearbyDonations = lazy(() => import('./pages/NearbyDonations'));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
    },
});

function PublicRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function RoleRoute({ children, roles }) {
    const { hasRole } = useAuth();
    return hasRole(...roles) ? children : <Navigate to="/dashboard" replace />;
}

const PageLoader = () => (
    <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
);

function AppRoutes() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/donations" element={<Donations />} />
                    <Route path="/donations/:id" element={<DonationDetail />} />
                    <Route path="/pickups" element={<Pickups />} />
                    <Route path="/nearby" element={<NearbyDonations />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/users" element={<RoleRoute roles={['ADMIN']}><Users /></RoleRoute>} />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Suspense>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <Toaster position="top-right" toastOptions={{
                        style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '500' },
                        success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
                    }} />
                    <AppRoutes />
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

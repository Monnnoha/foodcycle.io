import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const email = localStorage.getItem('email');
        const role = localStorage.getItem('role');
        const userId = localStorage.getItem('userId');
        const name = localStorage.getItem('name');
        const orgName = localStorage.getItem('orgName');
        return email ? { email, role, id: userId ? Number(userId) : null, name, orgName } : null;
    });

    const login = useCallback(async (email, password) => {
        const data = await authService.login(email, password);
        localStorage.setItem('userId', data.userId ?? '');
        localStorage.setItem('name', data.name ?? '');
        localStorage.setItem('orgName', data.orgName ?? '');
        setUser({
            email: data.email,
            role: data.role,
            id: data.userId ?? null,
            name: data.name ?? null,
            orgName: data.orgName ?? null,
        });
        return data;
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
    }, []);

    const hasRole = useCallback((...roles) => roles.includes(user?.role), [user]);

    return (
        <AuthContext.Provider value={{ user, login, logout, hasRole, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};

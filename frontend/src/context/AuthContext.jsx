import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const email = localStorage.getItem('email');
        const role = localStorage.getItem('role');
        return email ? { email, role } : null;
    });

    const login = useCallback(async (email, password) => {
        const data = await authService.login(email, password);
        setUser({ email: data.email, role: data.role });
        return data;
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
    }, []);

    const hasRole = useCallback((...roles) => {
        return roles.includes(user?.role);
    }, [user]);

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

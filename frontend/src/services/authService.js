import api from './api';

export const authService = {
    async login(email, password) {
        const { data } = await api.post('/auth/login', { email, password });
        const { token, role, email: userEmail, userId } = data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('email', userEmail);
        localStorage.setItem('userId', userId ?? '');
        return data.data;
    },

    async register(payload) {
        const { data } = await api.post('/auth/register', payload);
        return data.data;
    },

    logout() {
        localStorage.clear();
        window.location.href = '/login';
    },
};

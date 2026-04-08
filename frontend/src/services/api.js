import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Global response handler
api.interceptors.response.use(
    (res) => res,
    (err) => {
        // Only redirect on 401 for non-auth endpoints
        if (err.response?.status === 401 && !err.config?.url?.includes('/auth/')) {
            localStorage.clear();
            window.location.href = '/login';
        }
        const message = err.response?.data?.message || 'Something went wrong';
        return Promise.reject(new Error(message));
    }
);

export default api;

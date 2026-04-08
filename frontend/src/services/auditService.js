import api from './api';

export const auditService = {
    async getAll(page = 0, size = 20) {
        const { data } = await api.get('/audit-logs', { params: { page, size } });
        return data.data;
    },
    async getByUser(email, page = 0, size = 20) {
        const { data } = await api.get(`/audit-logs/user/${encodeURIComponent(email)}`, { params: { page, size } });
        return data.data;
    },
    async getByEntity(type, id, page = 0, size = 20) {
        const { data } = await api.get(`/audit-logs/entity/${type}/${id}`, { params: { page, size } });
        return data.data;
    },
    async getByAction(action, page = 0, size = 20) {
        const { data } = await api.get(`/audit-logs/action/${action}`, { params: { page, size } });
        return data.data;
    },
};

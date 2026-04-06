import api from './api';

export const notificationService = {
    async getAll(page = 0, size = 20) {
        const { data } = await api.get('/notifications', { params: { page, size } });
        return data.data;
    },

    async getUnread(page = 0, size = 20) {
        const { data } = await api.get('/notifications/unread', { params: { page, size } });
        return data.data;
    },

    async getUnreadCount() {
        const { data } = await api.get('/notifications/unread-count');
        return data.data;
    },

    async markRead(id) {
        const { data } = await api.put(`/notifications/${id}/read`);
        return data.data;
    },

    async markAllRead() {
        await api.patch('/notifications/mark-all-read');
    },
};

import api from './api';

export const userService = {
    async getAll(page = 0, size = 20) {
        const { data } = await api.get('/users', { params: { page, size } });
        return data.data;
    },
    async getById(id) {
        const { data } = await api.get(`/users/${id}`);
        return data.data;
    },
};

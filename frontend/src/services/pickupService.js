import api from './api';

export const pickupService = {
    async requestPickup(payload) {
        const { data } = await api.post('/pickups', payload);
        return data.data;
    },

    async getAll(page = 0, size = 10) {
        const { data } = await api.get('/pickups', { params: { page, size } });
        return data.data;
    },

    async getById(id) {
        const { data } = await api.get(`/pickups/${id}`);
        return data.data;
    },

    async getByDonation(donationId) {
        const { data } = await api.get(`/pickups/donation/${donationId}`);
        return data.data;
    },

    async update(id, payload) {
        const { data } = await api.put(`/pickups/${id}`, payload);
        return data.data;
    },

    async cancel(id) {
        await api.delete(`/pickups/${id}`);
    },

    async markPicked(donationId) {
        const { data } = await api.patch(`/pickups/donation/${donationId}/pick`);
        return data.data;
    },

    async markDelivered(donationId) {
        const { data } = await api.patch(`/pickups/donation/${donationId}/deliver`);
        return data.data;
    },
};

import api from './api';

export const donationService = {
    // Create donation — ALWAYS multipart (backend requires it)
    async create(donationData, imageFile) {
        const form = new FormData();
        form.append('donation', new Blob([JSON.stringify(donationData)], { type: 'application/json' }));
        if (imageFile) form.append('image', imageFile);
        const { data } = await api.post('/donations', form);
        return data.data;
    },

    async getAll() {
        const { data } = await api.get('/donations');
        return data.data;
    },

    async getById(id) {
        const { data } = await api.get(`/donations/${id}`);
        return data.data;
    },

    async getByDonor(donorId) {
        const { data } = await api.get(`/donations/donor/${donorId}`);
        return data.data;
    },

    // params: { keyword, foodType, city, status, dateFrom, dateTo, sortBy, sortDir, page, size }
    async search(params = {}) {
        const { data } = await api.get('/donations/search', { params });
        return data.data; // Spring Page: { content, totalPages, totalElements, number, size }
    },

    // params: { lat, lon, radiusKm, status, page, size }
    async searchNearby(params) {
        const { data } = await api.get('/donations/nearby', { params });
        return data.data;
    },

    async uploadImage(id, imageFile) {
        const form = new FormData();
        form.append('image', imageFile);
        const { data } = await api.post(`/donations/${id}/image`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.data;
    },

    async advanceStatus(id) {
        const { data } = await api.patch(`/donations/${id}/advance`);
        return data.data;
    },
};

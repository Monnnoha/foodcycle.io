import api from './api';

export const dashboardService = {
    async getAdminStats() {
        const { data } = await api.get('/dashboard/admin');
        return data.data;
    },

    async getDonorStats(donorId) {
        const { data } = await api.get(`/dashboard/donor/${donorId}`);
        return data.data;
    },

    async getVolunteerStats(volunteerId) {
        const { data } = await api.get(`/dashboard/volunteer/${volunteerId}`);
        return data.data;
    },
};

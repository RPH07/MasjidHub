import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: `${API_BASE_URL}/donasi`
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token};`
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const donasiService = {
    // CRUD Program Donasi
    getPrograms: (status) => {
        const params = status ? { status } : {};
        return api.get('/program', { params });
    },

    createProgram: (formData) => {
        return api.post('/program', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    updateProgram: (id, formData) => {
        return api.put(`/program/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    deleteProgram: async (id) => {
        try {
            const response = await api.delete(`/program/${id}`);
            return response;
        } catch (error) {
            console.error('Error deleting program:', error);
            // Throw error agar bisa di-catch di component
            throw {
                response: {
                    data: {
                        message: error.response?.data?.message || 'Gagal menghapus program donasi'
                    }
                }
            };
        }
    },

    // Kelola Status Program
    activateProgram: (id) => {
        return api.post(`/program/${id}/activate`);
    },

    deactivateProgram: (id) => {
        return api.post(`/program/${id}/deactivate`);
    },

    completeProgram: (id) => {
        return api.post(`/program/${id}/complete`);
    },

    // Donasi Management
    getActivePrograms: () => {
        return api.get('/program?status=aktif');
    },

    submitDonation: (programId, donationData) => {
        return api.post(`/submit/${programId}`, donationData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    getDonationHistory: (programId) => {
        return api.get(`/program/${programId}/donations`);
    }
};

export default donasiService;
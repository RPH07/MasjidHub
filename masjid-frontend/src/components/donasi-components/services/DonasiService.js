import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: `${API_BASE_URL}/donasi`
});

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

    deleteProgram: (id) => {
        return api.delete(`/program/${id}`);
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
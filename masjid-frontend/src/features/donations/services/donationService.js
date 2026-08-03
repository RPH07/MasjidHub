import api from '@/config/api';

export const donationService = {
    getPrograms: (status) => {
        const params = status && status !== 'all' ? { status } : {};
        return api.get('/pengadaan', { params });
    },

    getProgramById: (id) => {
        return api.get(`/pengadaan/${id}`);
    },

    getActivePrograms: () => {
        return api.get('/pengadaan', {
            params: {
                status: 'aktif'
            }
        });
    },

    createProgram: (formData) => {
        return api.post('/pengadaan', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    updateProgram: (id, formData) => {
        return api.put(`/pengadaan/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    changeProgramStatus: (id, status) => {
        return api.patch(`/pengadaan/${id}`, { status });
    },

    activateProgram: (id) => {
        return donationService.changeProgramStatus(id, 'aktif');
    },

    completeProgram: (id) => {
        return donationService.changeProgramStatus(id, 'selesai');
    },

    deactivateProgram: async () => {
        throw new Error('Program aktif belum bisa dinonaktifkan di backend baru. Gunakan aksi selesaikan program.');
    },

    deleteProgram: async () => {
        throw new Error('Hapus program belum tersedia di backend baru. Program draft bisa diedit atau tidak diaktifkan.');
    },

    submitDonation: (donationData) => {
        return api.post('/pengadaan/donasi', donationData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    uploadDonationProof: (donationId, proofData) => {
        return api.patch(`/pengadaan/donasi/${donationId}/upload`, proofData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    getDonationHistory: (programId, status = 'approved') => {
        return api.get(`/pengadaan/${programId}/donasi`, {
            params: { status }
        });
    },

    exportProgramPdf: (programId) => {
        return api.get(`/pengadaan/${programId}/export/pdf`, {
            responseType: 'blob',
            timeout: 30000
        });
    }
};

export default donationService;

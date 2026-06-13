import api from "@/config/api";

export const verifikasiService = {
    getPendingZakat: async() => {
        const response = await api.get("/zakat", {
            params: {
                status: 'pending'
            }
        });
        return response.data?.data || [];
    },

    getPendingDonasi: async() => {
        const response = await api.get('/pengadaan/donasi/pending');
        return response.data?.data || [];
    },
    
    verifyZakat: async(id, action, rejectReason = '') => {
        const response = await api.put(`/zakat/${id}/validate`, {
            action,
            reject_reason: rejectReason
        });
        return response.data;
    },

    verifyDonasi: async(id, action, rejectReason = '') => {
        const response = await api.put(`/pengadaan/donasi/${id}/validate`, {
            action,
            reject_reason: rejectReason
        });
        return response.data;
    }
}
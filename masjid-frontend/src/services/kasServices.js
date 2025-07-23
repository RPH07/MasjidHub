import apiService from './apiService';
import { API_ENDPOINTS } from '../config/api.config';

export const kasService = {
    // Get kas summary
    getSummary: (params) => {
        return apiService.get(API_ENDPOINTS.KAS.SUMMARY, params);
    },

    // Get kas data
    getKasData: (params) => {
        return apiService.get(API_ENDPOINTS.KAS.BASE, params);
    },

    // Get zakat data
    getZakatData: (params) => {
        return apiService.get(API_ENDPOINTS.KAS.ZAKAT, params);
    },

    // Get infaq data
    getInfaqData: (params) => {
        return apiService.get(API_ENDPOINTS.KAS.INFAQ, params);
    },

    // Get pending data
    getPendingData: () => {
        return apiService.get(API_ENDPOINTS.KAS.PENDING);
    },

    // Export kas data
    exportData: (format, period) => {
        return apiService.get(API_ENDPOINTS.KAS.EXPORT, { format, period }, {
            responseType: 'blob'
        });
    },

    // CRUD operations
    createTransaction: (data) => {
        return apiService.post(API_ENDPOINTS.KAS.BASE, data);
    },

    updateTransaction: (id, data) => {
        return apiService.put(`${API_ENDPOINTS.KAS.BASE}/${id}`, data);
    },

    deleteTransaction: (id) => {
        return apiService.delete(`${API_ENDPOINTS.KAS.BASE}/${id}`);
    },

    // Validation operations
    approveTransaction: (id, data) => {
        return apiService.post(`${API_ENDPOINTS.KAS.BASE}/${id}/approve`, data);
    },

    rejectTransaction: (id, data) => {
        return apiService.post(`${API_ENDPOINTS.KAS.BASE}/${id}/reject`, data);
    }
};

export default kasService;
import api from '@/config/api';

const buildParams = (filters = {}) => {
  const params = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      params[key] = value;
    }
  });

  return params;
};

const getFilenameFromDisposition = (disposition, fallback) => {
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1] || fallback;
};

const downloadBlob = (response, fallbackFilename) => {
  const filename = getFilenameFromDisposition(
    response.headers?.['content-disposition'],
    fallbackFilename
  );
  const blob = new Blob([response.data], {
    type: response.headers?.['content-type'] || 'application/octet-stream'
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return filename;
};

export const kasService = {
  getSummary: async (filters) => {
    const response = await api.get('/kas/summary', { params: buildParams(filters) });
    return response.data?.data || {};
  },

  getTransactions: async (filters) => {
    const response = await api.get('/kas/transactions', { params: buildParams(filters) });
    return response.data?.data || { transactions: [], pagination: {}, filters: {} };
  },

  getHistory: async (filters) => {
    const response = await api.get('/kas/history', { params: buildParams(filters) });
    return response.data?.data || { transactions: [], summary: {}, filters: {} };
  },

  createManual: async (payload) => {
    const response = await api.post('/kas', payload);
    return response.data;
  },

  updateManual: async (id, payload) => {
    const response = await api.put(`/kas/${id}`, payload);
    return response.data;
  },

  deleteManual: async (id) => {
    const response = await api.delete(`/kas/${id}`);
    return response.data;
  },

  requestVoid: async (id, reason) => {
    const response = await api.post(`/kas/${id}/void/request`, { reason });
    return response.data;
  },

  approveVoid: async (id) => {
    const response = await api.post(`/kas/${id}/void/approve`);
    return response.data;
  },

  rejectVoid: async (id, reject_reason) => {
    const response = await api.post(`/kas/${id}/void/reject`, { reject_reason });
    return response.data;
  },

  downloadHistoryExport: async (filters, format) => {
    const response = await api.get('/kas/history/export', {
      params: buildParams({ ...filters, format }),
      responseType: 'blob'
    });

    return downloadBlob(response, `laporan-kas.${format === 'csv' ? 'csv' : 'xlsx'}`);
  },

  downloadPdfReport: async (filters) => {
    const response = await api.get('/kas/report/pdf', {
      params: buildParams(filters),
      responseType: 'blob'
    });

    return downloadBlob(response, 'laporan-kas.pdf');
  }
};

export default kasService;

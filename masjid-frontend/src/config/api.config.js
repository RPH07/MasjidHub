// Base configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  UPLOAD_URL: import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000/uploads',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json'
  }
};

// API Endpoints 
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },

  // Kas endpoints
  KAS: {
    BASE: '/api/kas',
    SUMMARY: '/api/kas/summary',
    HISTORY: '/api/kas/history',
    EXPORT: '/api/kas/history/export',
    PENDING: '/api/kas/pending',
    ZAKAT: '/api/kas/zakat',
    INFAQ: '/api/kas/infaq'
  },

  // Donasi endpoints
  DONASI: {
    BASE: '/api/donasi',
    PROGRAM: '/api/donasi/program',
    HISTORY: '/api/donasi/history',
    EXPORT: '/api/donasi/export',
    SUBMIT: '/api/donasi/submit',
    USER_HISTORY: (userId) => `/api/donasi/history/user/${userId}`,
    PROGRAM_DONATIONS: (programId) => `/api/donasi/program/${programId}/donations`,
    PROGRAM_EXPORT: (programId) => `/api/donasi/program/${programId}/export`,
    PROGRAM_EXPORT_PDF: (programId) => `/api/donasi/program/${programId}/export/pdf`,
    PROGRAM_DETAIL: (programId) => `/api/donasi/program/${programId}`,
    PROGRAM_ACTIVATE: (programId) => `/api/donasi/program/${programId}/activate`,
    PROGRAM_DEACTIVATE: (programId) => `/api/donasi/program/${programId}/deactivate`,
    PROGRAM_COMPLETE: (programId) => `/api/donasi/program/${programId}/complete`
  },

  // Zakat endpoints
  ZAKAT: {
    BASE: '/api/zakat',
    HISTORY: (userId) => `/api/zakat/history/${userId}`,
    SUBMIT: '/api/zakat/submit'
  },

  // Infaq endpoints
  INFAQ: {
    BASE: '/api/infaq',
    SUBMIT: '/api/infaq/submit',
    HISTORY: (userId) => `/api/infaq/history/${userId}`
  },

  // Kegiatan endpoints
  KEGIATAN: {
    BASE: '/api/kegiatan',
    KATEGORI: '/api/kategori-kegiatan'
  },

  // User endpoints
  USER: {
    BASE: '/api/user',
    PROFILE: '/api/user/profile'
  },

  // Kontribusi endpoints
  KONTRIBUSI: {
    HISTORY: (userId) => `/api/kontribusi/history/${userId}`,
    SUMMARY: (userId) => `/api/kontribusi/summary/${userId}`
  },

  // Upload folders
  UPLOADS: {
    BASE: 'uploads',
    PROGRAM_IMAGES: 'uploads/program-images',
    BUKTI_ZAKAT: '/uploads/bukti-zakat',
    BUKTI_INFAQ: '/uploads/bukti-infaq', 
    BUKTI_DONASI: '/uploads/bukti-donasi',
    KEGIATAN_PHOTOS: '/uploads/kegiatan-photos'
  }
};

// Helper functions
export const buildApiUrl = (endpoint, params = {}) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

export const buildUploadUrl = (folderPath, fileName) => {
  return `${API_CONFIG.UPLOAD_URL}/${folderPath}/${fileName}`;
};
import axios from "axios";

export const AUTH_SESSION_MESSAGE_KEY = 'authSessionMessage';
export const AUTH_SESSION_EXPIRED_MESSAGE = 'Sesi Anda telah berakhir demi keamanan akun. Silakan login kembali.';
export const AUTH_CHANGED_EVENT = 'authChanged';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
            sessionStorage.setItem(AUTH_SESSION_MESSAGE_KEY, AUTH_SESSION_EXPIRED_MESSAGE);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

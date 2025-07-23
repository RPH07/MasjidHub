import axiosInstance from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';

class AuthService {
  // Login user
  async login(credentials) {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Simpan data ke localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      localStorage.setItem('userRole', response.data.user.role);
    }
    
    return response.data;
  }

  // Register user biasa
  async register(userData) {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  }

  // Register admin
  async registerAdmin(adminData) {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.ADMIN_REGISTER, adminData);
    return response.data;
  }

  // Logout
  async logout() {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (logoutError) {
      console.warn('Logout endpoint failed, proceeding with local cleanup:', logoutError.message);
    } finally {
      // Clear local storage regardless of API call result
      this.clearAuthData();
    }
  }

  // Clear authentication data
  clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
  }

  // Get current user data
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (parseError) {
      console.error('Error parsing user data:', parseError);
      return null;
    }
  }

  // Get current user role
  getUserRole() {
    return localStorage.getItem('userRole');
  }

  // Get auth token
  getToken() {
    return localStorage.getItem('token');
  }

  // cek jika user adalah authenticated
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  // cek jika user adalah admin
  isAdmin() {
    const role = this.getUserRole();
    return role === 'admin';
  }

  // Get user profile
  async getProfile() {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.PROFILE);
    return response.data;
  }

  // Update user profile
  async updateProfile(profileData) {
    const response = await axiosInstance.put(API_ENDPOINTS.USER.PROFILE, profileData);
    
    if (response.data.user) {
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  // cek jika token is expired
  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (tokenError) {
      console.warn('Invalid token format', tokenError);
      return true;
    }
  }

  // Auto logout jika token expired
  checkAndHandleExpiredToken() {
    if (this.isAuthenticated() && this.isTokenExpired()) {
      console.warn('Token expired, clearing auth data');
      this.clearAuthData();
      
      // Optionally redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      return false;
    }
    return true;
  }
}

export default new AuthService();
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

// User API
export const userAPI = {
  createPass: (passData) => api.post('/user/passes/create', passData),
  getLatestPass: () => api.get('/user/passes/latest'),
  getPassHistory: () => api.get('/user/passes/history'),
  requestMiningPermission: () => api.post('/user/permissions/request'),
  getMiningPermissionStatus: () => api.get('/user/permissions/status'),
  mineBlock: () => api.post('/admin/mine'),
};

// Admin API
export const adminAPI = {
  getMempool: () => api.get('/admin/mempool'),
  mineBlock: (data) => api.post('/admin/mine', data),
  getBlocks: () => api.get('/admin/blocks'),
  approveMiningPermission: (userId) => api.post(`/admin/permissions/approve/${userId}`),
  transferTokens: (data) => api.post('/admin/tokens/sell', data),
  getUsers: () => api.get('/admin/users'),
  validateChain: () => api.get('/admin/validate-chain'),
  getMiningRequests: () => api.get('/admin/mining-requests'),
  approveMiningRequest: (userId) => api.put(`/admin/mining-requests/${userId}/approve`),
  rejectMiningRequest: (userId) => api.put(`/admin/mining-requests/${userId}/reject`),
};

// Common API - accessible to all authenticated users
export const commonAPI = {
  validateChain: () => api.get('/admin/validate-chain'),
  exploreChain: () => api.get('/admin/blocks'),
};

// Payment API
export const paymentAPI = {
  createOrder: (amount) => api.post('/payments/order', { amount }),
  verifyPayment: (data) => api.post('/payments/verify', data),
  verifyPass: (data) => api.post('/payments/passes/verify', data),
};

export default api;

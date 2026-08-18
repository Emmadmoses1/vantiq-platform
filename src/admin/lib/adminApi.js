import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class AdminAPI {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/admin`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(email, password) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  // Dashboard
  async getDashboardStats() {
    const response = await this.client.get('/dashboard');
    return response.data;
  }

  // Users
  async getUsers(params = {}) {
    const response = await this.client.get('/users', { params });
    return response.data;
  }

  async getUserDetails(userId) {
    const response = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  async activateSubscription(userId, planId, months) {
    const response = await this.client.post('/users/activate-subscription', {
      userId,
      planId,
      months,
    });
    return response.data;
  }

  // Signals
  async getPendingSignals() {
    const response = await this.client.get('/signals/pending');
    return response.data;
  }

  async approveSignal(signalId, autoPublish = false) {
    const response = await this.client.post(`/signals/${signalId}/approve`, { autoPublish });
    return response.data;
  }

  async rejectSignal(signalId, reason) {
    const response = await this.client.post(`/signals/${signalId}/reject`, { reason });
    return response.data;
  }

  async createSignal(signalData) {
    const response = await this.client.post('/signals/create', signalData);
    return response.data;
  }

  async getAllSignals(params = {}) {
    const response = await this.client.get('/signals', { params });
    return response.data;
  }

  // Payments
  async getPayments(params = {}) {
    const response = await this.client.get('/payments', { params });
    return response.data;
  }

  // Audit Logs
  async getAuditLogs(params = {}) {
    const response = await this.client.get('/audit-logs', { params });
    return response.data;
  }
}

export default new AdminAPI();
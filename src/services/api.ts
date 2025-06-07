import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '../types/api';
import { generateTraceId } from '../utils/api';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token and trace ID
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        
        // Add trace ID to all requests
        if (config.data && typeof config.data === 'object') {
          config.data.traceId = config.data.traceId || generateTraceId();
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              if (response.data?.access_token) {
                this.setToken(response.data.access_token);
                localStorage.setItem('access_token', response.data.access_token);
                // Retry the original request
                return this.api.request(error.config);
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              this.logout();
              // Don't redirect here, let the auth context handle it
            }
          } else {
            this.logout();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
  }

  logout() {
    this.token = null;
  }

  // Authentication
  async login(username: string, password: string): Promise<ApiResponse> {
    const response = await this.api.post('/auth/login', {
      username,
      password,
      traceId: generateTraceId(),
    });
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse> {
    const response = await this.api.post('/auth/refresh', {
      refresh_token: refreshToken,
      traceId: generateTraceId(),
    });
    return response.data;
  }

  // Users
  async getUsers(params?: { household_id?: number; role?: string }): Promise<ApiResponse> {
    const response = await this.api.get('/users', { params });
    return response.data;
  }

  async getUser(userId: number): Promise<ApiResponse> {
    const response = await this.api.get(`/users/${userId}`);
    return response.data;
  }

  async updateUser(userId: number, data: any): Promise<ApiResponse> {
    const response = await this.api.patch(`/users/${userId}`, {
      ...data,
      traceId: generateTraceId(),
    });
    return response.data;
  }

  // Households
  async getHouseholds(): Promise<ApiResponse> {
    const response = await this.api.get('/households');
    return response.data;
  }

  async getHousehold(householdId: number): Promise<ApiResponse> {
    const response = await this.api.get(`/households/${householdId}`);
    return response.data;
  }

  // Chores
  async getChores(params?: any): Promise<ApiResponse> {
    const response = await this.api.get('/chores', { params });
    return response.data;
  }

  async getChore(choreId: number): Promise<ApiResponse> {
    const response = await this.api.get(`/chores/${choreId}`);
    return response.data;
  }

  async createChore(data: any): Promise<ApiResponse> {
    const response = await this.api.post('/chores', {
      ...data,
      traceId: generateTraceId(),
    });
    return response.data;
  }

  async updateChore(choreId: number, data: any): Promise<ApiResponse> {
    const response = await this.api.patch(`/chores/${choreId}`, {
      ...data,
      traceId: generateTraceId(),
    });
    return response.data;
  }

  async completeChore(choreId: number, notes?: string): Promise<ApiResponse> {
    const response = await this.api.post(`/chores/${choreId}/complete`, {
      notes,
      traceId: generateTraceId(),
    });
    return response.data;
  }

  async approveChore(choreId: number, approved: boolean, feedback?: string): Promise<ApiResponse> {
    const response = await this.api.post(`/chores/${choreId}/approve`, {
      approved,
      feedback,
      traceId: generateTraceId(),
    });
    return response.data;
  }

  // Rewards
  async getRewards(params?: any): Promise<ApiResponse> {
    const response = await this.api.get('/rewards', { params });
    return response.data;
  }

  async createReward(data: any): Promise<ApiResponse> {
    const response = await this.api.post('/rewards', {
      ...data,
      traceId: generateTraceId(),
    });
    return response.data;
  }

  async updateReward(rewardId: number, data: any): Promise<ApiResponse> {
    const response = await this.api.patch(`/rewards/${rewardId}`, {
      ...data,
      traceId: generateTraceId(),
    });
    return response.data;
  }

  async redeemReward(rewardId: number): Promise<ApiResponse> {
    const response = await this.api.post(`/rewards/${rewardId}/redeem`, {
      traceId: generateTraceId(),
    });
    return response.data;
  }

  // Events
  async getEvents(params?: any): Promise<ApiResponse> {
    const response = await this.api.get('/events', { params });
    return response.data;
  }

  async createEvent(data: any): Promise<ApiResponse> {
    const response = await this.api.post('/events', {
      ...data,
      traceId: generateTraceId(),
    });
    return response.data;
  }

  async updateEvent(eventId: number, data: any): Promise<ApiResponse> {
    const response = await this.api.patch(`/events/${eventId}`, {
      ...data,
      traceId: generateTraceId(),
    });
    return response.data;
  }

  // Analytics
  async getLeaderboard(householdId: number, period: string = 'month'): Promise<ApiResponse> {
    const response = await this.api.get('/analytics/leaderboard', {
      params: { household_id: householdId, period },
    });
    return response.data;
  }

  async getUserSummary(userId?: number, period: string = 'month'): Promise<ApiResponse> {
    const response = await this.api.get('/analytics/user-summary', {
      params: { user_id: userId, period },
    });
    return response.data;
  }

  // Transactions
  async getTransactions(params?: any): Promise<ApiResponse> {
    const response = await this.api.get('/transactions', { params });
    return response.data;
  }
}

export const apiService = new ApiService();
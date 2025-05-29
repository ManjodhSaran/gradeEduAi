import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://api.example.com';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 error and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get refresh token
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        
        if (!refreshToken) {
          // No refresh token, redirect to login
          return Promise.reject(error);
        }
        
        // Attempt to refresh token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        
        if (response.data.token) {
          // Store new tokens
          await SecureStore.setItemAsync('auth_token', response.data.token);
          if (response.data.refresh_token) {
            await SecureStore.setItemAsync('refresh_token', response.data.refresh_token);
          }
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Token refresh failed
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const assemblyAiApi = axios.create({
  baseURL: 'https://api.assemblyai.com/v2',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': Constants.expoConfig?.extra?.assemblyAiApiKey || '',
  },
});

export default api;
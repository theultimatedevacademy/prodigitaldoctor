/**
 * API Client
 * Axios instance with interceptors, token handling, retry logic, and network checks
 */

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';

// Get API base URL from environment variable
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get Clerk JWT token
 * First tries to get from Clerk (fresh token), falls back to SecureStore
 */
const getAuthToken = async () => {
  try {
    // Try to get fresh token from Clerk if available
    // This is set by the auth hook when user is signed in
    if (global.getClerkToken) {
      const freshToken = await global.getClerkToken();
      if (freshToken) {
        return freshToken;
      }
    }
    
    // Fallback to stored token
    const token = await SecureStore.getItemAsync('clerk-token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Check network connectivity
 */
const checkNetworkConnectivity = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected;
};

/**
 * Exponential backoff delay calculation
 */
const getRetryDelay = (retryCount) => {
  return Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
};

/**
 * Request Interceptor
 * - Checks network connectivity
 * - Attaches Clerk JWT token
 * - Logs request details
 */
apiClient.interceptors.request.use(
  async (config) => {
    // Check network connectivity before making request
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      return Promise.reject({
        message: 'No internet connection',
        isNetworkError: true,
        config,
      });
    }

    // Get and attach auth token
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request (only in development)
    if (__DEV__) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        params: config.params,
        data: config.data,
        headers: {
          ...config.headers,
          Authorization: token ? 'Bearer [REDACTED]' : undefined,
        },
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handles errors (401, 403, 500, network errors)
 * - Implements retry logic with exponential backoff
 * - Logs response details
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response (only in development)
    if (__DEV__) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error (only in development)
    if (__DEV__) {
      console.error('❌ API Error:', {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data,
      });
    }

    // Handle network errors
    if (error.isNetworkError || error.message === 'Network Error') {
      return Promise.reject({
        message: 'No internet connection. Please check your network.',
        isNetworkError: true,
        originalError: error,
      });
    }

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      // Clear invalid token
      await SecureStore.deleteItemAsync('clerk-token');
      
      return Promise.reject({
        message: 'Session expired. Please login again.',
        status: 401,
        requiresAuth: true,
        originalError: error,
      });
    }

    // Handle 403 Forbidden - Permission denied
    if (error.response?.status === 403) {
      return Promise.reject({
        message: error.response?.data?.message || 'You do not have permission to perform this action.',
        status: 403,
        permissionDenied: true,
        originalError: error,
      });
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      return Promise.reject({
        message: error.response?.data?.error || 'Resource not found.',
        status: 404,
        originalError: error,
      });
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      return Promise.reject({
        message: 'Server error. Please try again later.',
        status: 500,
        isServerError: true,
        originalError: error,
      });
    }

    // Retry logic for failed requests (excluding 4xx errors)
    const shouldRetry = 
      !originalRequest._retry && 
      error.response?.status >= 500 && 
      error.response?.status < 600;

    if (shouldRetry) {
      originalRequest._retry = true;
      originalRequest._retryCount = originalRequest._retryCount || 0;

      // Max 3 retries
      if (originalRequest._retryCount < 3) {
        originalRequest._retryCount += 1;
        
        // Calculate delay with exponential backoff
        const delay = getRetryDelay(originalRequest._retryCount);
        
        if (__DEV__) {
          console.log(`🔄 Retrying request (attempt ${originalRequest._retryCount}/3) after ${delay}ms...`);
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));

        // Retry the request
        return apiClient(originalRequest);
      }
    }

    // Return formatted error
    return Promise.reject({
      message: error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    });
  }
);

/**
 * HTTP Methods
 */

/**
 * GET request
 */
export const get = async (url, config = {}) => {
  try {
    const response = await apiClient.get(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * POST request
 */
export const post = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * PUT request
 */
export const put = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.put(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * PATCH request
 */
export const patch = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.patch(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * DELETE request
 */
export const del = async (url, config = {}) => {
  try {
    const response = await apiClient.delete(url, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload file (multipart/form-data)
 */
export const upload = async (url, formData, onUploadProgress) => {
  try {
    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default apiClient;

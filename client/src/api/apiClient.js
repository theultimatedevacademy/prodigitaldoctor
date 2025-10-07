/**
 * API Client
 * Handles all HTTP requests with Clerk authentication
 */

import axios from 'axios';
import { API_BASE_URL, MOCK_MODE } from '../utils/constants';

/**
 * Create axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add Clerk JWT token
 */
apiClient.interceptors.request.use(
  async (config) => {
    // Get Clerk session token
    if (window.Clerk) {
      try {
        const token = await window.Clerk.session?.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting Clerk token:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized - refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh Clerk session
        if (window.Clerk) {
          await window.Clerk.session?.reload();
          const token = await window.Clerk.session?.getToken();
          
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Redirect to sign-in if refresh fails
        window.location.href = '/sign-in';
        return Promise.reject(refreshError);
      }
    }
    
    // Format error for consistent handling
    const formattedError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status,
      errors: error.response?.data?.errors || [],
      data: error.response?.data,
    };
    
    return Promise.reject(formattedError);
  }
);

/**
 * Generic GET request
 * @param {string} url - Endpoint URL
 * @param {object} config - Axios config
 * @returns {Promise} Response data
 */
export async function get(url, config = {}) {
  const response = await apiClient.get(url, config);
  return response.data;
}

/**
 * Generic POST request
 * @param {string} url - Endpoint URL
 * @param {object} data - Request body
 * @param {object} config - Axios config
 * @returns {Promise} Response data
 */
export async function post(url, data = {}, config = {}) {
  const response = await apiClient.post(url, data, config);
  return response.data;
}

/**
 * Generic PUT request
 * @param {string} url - Endpoint URL
 * @param {object} data - Request body
 * @param {object} config - Axios config
 * @returns {Promise} Response data
 */
export async function put(url, data = {}, config = {}) {
  const response = await apiClient.put(url, data, config);
  return response.data;
}

/**
 * Generic PATCH request
 * @param {string} url - Endpoint URL
 * @param {object} data - Request body
 * @param {object} config - Axios config
 * @returns {Promise} Response data
 */
export async function patch(url, data = {}, config = {}) {
  const response = await apiClient.patch(url, data, config);
  return response.data;
}

/**
 * Generic DELETE request
 * @param {string} url - Endpoint URL
 * @param {object} config - Axios config
 * @returns {Promise} Response data
 */
export async function del(url, config = {}) {
  const response = await apiClient.delete(url, config);
  return response.data;
}

/**
 * Upload file to presigned URL
 * @param {string} presignedUrl - Presigned URL
 * @param {File} file - File to upload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise} Upload response
 */
export async function uploadFile(presignedUrl, file, onProgress) {
  const config = {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  };
  
  return axios.put(presignedUrl, file, config);
}

/**
 * Upload file using multipart form (for POST presigned URLs)
 * @param {string} url - Upload URL
 * @param {object} fields - Form fields from presigned response
 * @param {File} file - File to upload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise} Upload response
 */
export async function uploadFileMultipart(url, fields, file, onProgress) {
  const formData = new FormData();
  
  // Add all fields from presigned response
  Object.keys(fields).forEach(key => {
    formData.append(key, fields[key]);
  });
  
  // Add file last
  formData.append('file', file);
  
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  };
  
  return axios.post(url, formData, config);
}

export default apiClient;

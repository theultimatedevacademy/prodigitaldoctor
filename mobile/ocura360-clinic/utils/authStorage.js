/**
 * Auth Storage Utilities
 * Helper functions to store and retrieve Clerk JWT token
 */

import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'clerk-token';

/**
 * Save Clerk JWT token to SecureStore
 */
export const saveAuthToken = async (token) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error saving auth token:', error);
    return false;
  }
};

/**
 * Get Clerk JWT token from SecureStore
 */
export const getAuthToken = async () => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Remove Clerk JWT token from SecureStore
 */
export const removeAuthToken = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('Error removing auth token:', error);
    return false;
  }
};

/**
 * Check if auth token exists
 */
export const hasAuthToken = async () => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return !!token;
  } catch (error) {
    console.error('Error checking auth token:', error);
    return false;
  }
};

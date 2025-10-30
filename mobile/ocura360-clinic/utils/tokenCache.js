import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Token cache for storing Clerk session tokens securely
 * Uses SecureStore on iOS/Android, memory storage on web
 */

// Memory storage fallback for web
const memoryCache = {};

const createTokenCache = () => {
  return {
    async getToken(key) {
      try {
        if (Platform.OS === 'web') {
          return memoryCache[key] || null;
        }
        const item = await SecureStore.getItemAsync(key);
        return item;
      } catch (error) {
        console.error('Error getting token:', error);
        return null;
      }
    },
    async saveToken(key, value) {
      try {
        if (Platform.OS === 'web') {
          memoryCache[key] = value;
          return;
        }
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.error('Error saving token:', error);
      }
    },
  };
};

export default createTokenCache;

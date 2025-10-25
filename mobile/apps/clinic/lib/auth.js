import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Token cache for Clerk authentication
export const tokenCache = {
  async getToken(key) {
    try {
      if (Platform.OS === "web") {
        return globalThis?.localStorage?.getItem(key);
      }
      return SecureStore.getItemAsync(key);
    } catch (err) {
      console.error("Error getting token:", err);
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      if (Platform.OS === "web") {
        return globalThis?.localStorage?.setItem(key, value);
      }
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error("Error saving token:", err);
    }
  },
};

import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

/**
 * Preloads the browser for Android devices to reduce authentication load time
 * See: https://docs.expo.dev/guides/authentication/#improving-user-experience
 */
export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    
    // Warm up the browser
    void WebBrowser.warmUpAsync();
    
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

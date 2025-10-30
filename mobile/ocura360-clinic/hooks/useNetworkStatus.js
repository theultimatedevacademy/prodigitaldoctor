/**
 * Network Status Hook
 * Monitor network connectivity status
 */

import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Hook to monitor network connectivity
 * @returns {object} { isConnected, isInternetReachable, type }
 */
export function useNetworkStatus() {
  const [networkState, setNetworkState] = useState({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
      });
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return networkState;
}

/**
 * Check if network is available (one-time check)
 */
export async function checkNetworkAvailability() {
  const state = await NetInfo.fetch();
  return {
    isConnected: state.isConnected ?? false,
    isInternetReachable: state.isInternetReachable ?? false,
    type: state.type,
  };
}

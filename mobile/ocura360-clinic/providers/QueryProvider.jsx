/**
 * React Query Provider
 * Configures QueryClient with caching, persistence, and retry logic
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { CACHE_TIMES, STALE_TIMES } from '../utils/constants';

/**
 * Create QueryClient with default options
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - Data is considered fresh for 2 minutes
      staleTime: STALE_TIMES.MEDIUM, // 2 minutes

      // Cache time - Data stays in cache for 10 minutes
      cacheTime: CACHE_TIMES.LONG, // 10 minutes

      // Retry logic - Retry failed queries 3 times
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff

      // Refetch on window focus - Disabled for mobile
      refetchOnWindowFocus: false,

      // Refetch on reconnect - Enabled for mobile
      refetchOnReconnect: true,

      // Refetch on mount - Only if data is stale
      refetchOnMount: 'always',

      // Network mode - Online first, then cache
      networkMode: 'online',

      // Use error boundary
      useErrorBoundary: false,

      // Suspense mode - Disabled
      suspense: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      retryDelay: 1000,

      // Network mode - Only online for mutations
      networkMode: 'online',

      // Use error boundary
      useErrorBoundary: false,
    },
  },
});

/**
 * Custom network status checker for React Query
 */
const onlineManager = {
  setEventListener: (setOnline) => {
    return NetInfo.addEventListener((state) => {
      setOnline(state.isConnected ?? false);
    });
  },
};

/**
 * QueryProvider Component
 * Wraps app with QueryClientProvider
 * Note: Basic caching without persistence due to package compatibility
 */
export function QueryProvider({ children }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

/**
 * Export queryClient for direct access if needed
 */
export { queryClient };

export default QueryProvider;

/**
 * Authentication API Hooks
 * Handles user authentication, profile fetching, and role management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import { get, patch } from '../apiClient';
import { API_ENDPOINTS, QUERY_KEYS, STALE_TIMES } from '../../utils/constants';
import { saveAuthToken, removeAuthToken } from '../../utils/authStorage';
import { useEffect, useRef } from 'react';

/**
 * Hook to get current user profile from backend
 * Automatically syncs with Clerk authentication
 * @returns {object} Query result with user data
 */
export function useMe() {
  const { isSignedIn, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const tokenSyncedRef = useRef(false);
  const lastUserIdRef = useRef(null);

  // Automatically save Clerk token when user signs in
  // Only sync once per session or when user changes
  useEffect(() => {
    const syncToken = async () => {
      const currentUserId = clerkUser?.id;

      // Only sync if:
      // 1. Not synced yet, OR
      // 2. User has changed (different user ID)
      if (isSignedIn && clerkUser) {
        const shouldSync = !tokenSyncedRef.current || lastUserIdRef.current !== currentUserId;

        if (shouldSync) {
          try {
            // Set global function to get fresh token
            global.getClerkToken = async () => {
              try {
                // Don't use template parameter - use default Clerk token
                return await getToken();
              } catch (error) {
                console.error('Error getting fresh Clerk token:', error);
                return null;
              }
            };

            const token = await getToken();
            if (token) {
              await saveAuthToken(token);
              tokenSyncedRef.current = true;
              lastUserIdRef.current = currentUserId;
              if (__DEV__) {
                console.log('✅ Clerk token saved to SecureStore');
              }
            }
          } catch (error) {
            console.error('Error saving Clerk token:', error);
          }
        }
      } else {
        // Remove token when user signs out
        global.getClerkToken = null;
        tokenSyncedRef.current = false;
        lastUserIdRef.current = null;
        await removeAuthToken();
      }
    };

    syncToken();
  }, [isSignedIn, clerkUser, getToken]);

  return useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: async () => {
      // Ensure we have a fresh token before fetching
      if (isSignedIn) {
        const token = await getToken();
        if (token) {
          await saveAuthToken(token);
        }
      }

      try {
        return await get(API_ENDPOINTS.ME);
      } catch (error) {
        // Handle 404 gracefully - user might not exist in DB yet
        if (error.status === 404) {
          console.log('ℹ️ User not found in database - may need to complete onboarding');
          // Return a minimal user object with Clerk data
          return {
            clerkId: clerkUser?.id,
            email: clerkUser?.primaryEmailAddress?.emailAddress,
            name: clerkUser?.fullName || clerkUser?.firstName,
            subscription: {
              plan: 'free',
              status: 'active',
              maxClinics: 1,
            },
          };
        }
        throw error;
      }
    },
    enabled: isSignedIn, // Only fetch when user is signed in
    staleTime: Infinity, // Never consider stale - user data rarely changes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 2, // Retry twice on failure
    refetchOnMount: false, // Don't refetch on component mount
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    onError: (error) => {
      console.error('Error fetching user profile:', error);
      // If 401, token is invalid - sign out
      if (error.status === 401 || error.requiresAuth) {
        removeAuthToken();
      }
    },
  });
}

/**
 * Hook to update current user's role/profile
 * @returns {object} Mutation object
 */
export function useUpdateMyRole() {
  const queryClient = useQueryClient();
  const { getToken } = useClerkAuth();

  return useMutation({
    mutationFn: async (data) => {
      // Refresh token before mutation
      const token = await getToken();
      if (token) {
        await saveAuthToken(token);
      }
      return patch(API_ENDPOINTS.UPDATE_MY_ROLE, data);
    },
    onSuccess: (data) => {
      // Update cached user data
      queryClient.setQueryData(QUERY_KEYS.ME, data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLINICS });

      if (__DEV__) {
        console.log('✅ User profile updated successfully');
      }
    },
    onError: (error) => {
      console.error('Error updating user profile:', error);
    },
  });
}

/**
 * Hook to handle Clerk token refresh
 * Automatically refreshes token and saves to SecureStore
 * @returns {object} { refreshToken, isRefreshing }
 */
export function useTokenRefresh() {
  const { getToken } = useClerkAuth();
  const queryClient = useQueryClient();

  const refreshToken = async () => {
    try {
      // Force token refresh from Clerk
      const token = await getToken();

      if (token) {
        await saveAuthToken(token);

        // Invalidate all queries to refetch with new token
        queryClient.invalidateQueries();

        if (__DEV__) {
          console.log('✅ Token refreshed successfully');
        }

        return { success: true, token };
      }

      return { success: false, error: 'No token received' };
    } catch (error) {
      console.error('Error refreshing token:', error);
      return { success: false, error: error.message };
    }
  };

  return { refreshToken };
}

/**
 * Hook to sign out user
 * Clears token and invalidates all queries
 * @returns {object} { signOut, isSigningOut }
 */
export function useSignOut() {
  const { signOut: clerkSignOut } = useClerkAuth();
  const queryClient = useQueryClient();

  const signOut = async () => {
    try {
      // Clear token from SecureStore
      await removeAuthToken();

      // Clear all React Query cache
      queryClient.clear();

      // Sign out from Clerk
      await clerkSignOut();

      if (__DEV__) {
        console.log('✅ User signed out successfully');
      }

      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error.message };
    }
  };

  return { signOut };
}

/**
 * Hook to get authentication status
 * Combines Clerk auth status with backend user data
 * @returns {object} { isAuthenticated, isLoading, user, clerkUser }
 */
export function useAuthStatus() {
  const { isSignedIn, isLoaded: clerkLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { data: backendUser, isLoading: userLoading } = useMe();

  return {
    isAuthenticated: isSignedIn && !!backendUser,
    isLoading: !clerkLoaded || (isSignedIn && userLoading),
    user: backendUser,
    clerkUser,
    hasBackendProfile: !!backendUser,
  };
}

/**
 * Hook to check if user has specific role
 * @param {string} role - Role to check (e.g., 'doctor', 'staff', 'clinic_owner')
 * @returns {boolean} Whether user has the role
 */
export function useHasRole(role) {
  const { data: user } = useMe();

  // Check if user has admin role
  if (role === 'admin') {
    return user?.isAdmin === true;
  }

  // For clinic roles, this will be checked in ClinicContext
  // This hook is for global roles only
  return false;
}

/**
 * Hook to sync Clerk user with backend
 * Creates/updates backend user profile based on Clerk data
 * @returns {object} Mutation object
 */
export function useSyncClerkUser() {
  const queryClient = useQueryClient();
  const { user: clerkUser } = useUser();
  const { getToken } = useClerkAuth();

  return useMutation({
    mutationFn: async () => {
      if (!clerkUser) {
        throw new Error('No Clerk user found');
      }

      // Ensure token is fresh
      const token = await getToken();
      if (token) {
        await saveAuthToken(token);
      }

      // Backend will automatically create/update user on /auth/me call
      return get(API_ENDPOINTS.ME);
    },
    onSuccess: (data) => {
      // Update cached user data
      queryClient.setQueryData(QUERY_KEYS.ME, data);

      if (__DEV__) {
        console.log('✅ Clerk user synced with backend');
      }
    },
    onError: (error) => {
      console.error('Error syncing Clerk user:', error);
    },
  });
}

export default {
  useMe,
  useUpdateMyRole,
  useTokenRefresh,
  useSignOut,
  useAuthStatus,
  useHasRole,
  useSyncClerkUser,
};

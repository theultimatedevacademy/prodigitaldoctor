/**
 * Auth API hooks using React Query
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { get } from "../apiClient";
import { API_ENDPOINTS, QUERY_KEYS } from "../../utils/constants";

/**
 * Hook to fetch current user profile from backend
 * Maps Clerk user to application user profile
 * @returns {object} Query result with user data
 */
export function useMe() {
  return useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: () => get(API_ENDPOINTS.ME),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to refetch current user
 * Useful after profile updates
 */
export function useRefetchMe() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME });
  };
}

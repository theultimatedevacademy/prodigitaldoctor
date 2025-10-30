/**
 * Medication API hooks using React Query
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { get, post } from '../apiClient';
import { API_ENDPOINTS, QUERY_KEYS, STALE_TIMES } from '../../utils/constants';

/**
 * Hook to search medications
 * @param {string} query - Search query
 * @param {object} options - React Query options
 * @returns {object} Query result with medications data
 */
export function useSearchMedications(query, options = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.MEDICATIONS, 'search', query],
    queryFn: () => get(`${API_ENDPOINTS.MEDICATIONS}/search?q=${encodeURIComponent(query)}`),
    enabled: !!query && query.length >= 2, // Only search if query is at least 2 characters
    staleTime: STALE_TIMES.LONG, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch all medications with filters
 * @param {object} filters - Query filters (search, category, etc.)
 * @param {object} options - React Query options
 * @returns {object} Query result with medications data
 */
export function useMedications(filters = {}, options = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.MEDICATIONS, filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.composition) params.append('composition', filters.composition);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      return get(`${API_ENDPOINTS.MEDICATIONS}/search?${params.toString()}`);
    },
    staleTime: STALE_TIMES.LONG, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch a single medication by ID
 * @param {string} medicationId - Medication ID
 * @returns {object} Query result with medication data
 */
export function useMedication(medicationId) {
  return useQuery({
    queryKey: QUERY_KEYS.MEDICATION(medicationId),
    queryFn: () => get(`${API_ENDPOINTS.MEDICATIONS}/${medicationId}`),
    enabled: !!medicationId,
    staleTime: STALE_TIMES.VERY_LONG, // 10 minutes - medication data doesn't change often
  });
}

/**
 * Hook to check drug-drug interactions
 * @returns {object} Mutation object
 */
export function useCheckDDI() {
  return useMutation({
    mutationFn: (medicationIds) => post(`${API_ENDPOINTS.MEDICATIONS}/check-ddi`, { medicationIds }),
  });
}

export default {
  useSearchMedications,
  useMedications,
  useMedication,
  useCheckDDI,
};

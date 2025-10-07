/**
 * Medication API hooks using React Query
 */

import { useQuery } from '@tanstack/react-query';
import { get } from '../apiClient';
import { API_ENDPOINTS, QUERY_KEYS } from '../../utils/constants';

/**
 * Hook to search medications
 * @param {string} query - Search query
 * @param {object} filters - Additional filters (composition, category)
 * @returns {object} Query result with medications data
 */
export function useSearchMedications(query, filters = {}) {
  const params = new URLSearchParams({
    q: query,
    ...filters,
  }).toString();
  
  return useQuery({
    queryKey: [...QUERY_KEYS.MEDICATIONS, 'search', query, filters],
    queryFn: () => get(`${API_ENDPOINTS.MEDICATIONS}?${params}`),
    enabled: !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    queryFn: () => get(API_ENDPOINTS.MEDICATION_BY_ID(medicationId)),
    enabled: !!medicationId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

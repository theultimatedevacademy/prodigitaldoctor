/**
 * Medication API hooks using React Query
 */

import { useQuery } from '@tanstack/react-query';
import { get, post } from '../apiClient';
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
    queryFn: () => get(`${API_ENDPOINTS.MEDICATIONS_SEARCH}?${params}`),
    enabled: !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single medication by ID with full details
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

/**
 * Hook to fetch medication details with DDI information
 * @param {object} medication - Medication object with compositions
 * @returns {object} Query result with DDI warnings
 */
export function useMedicationDDI(medication) {
  const compositionIds = medication?.unique_composition?.map(c => c._id || c) || [];
  
  return useQuery({
    queryKey: ['medication-ddi', medication?._id, compositionIds],
    queryFn: async () => {
      if (compositionIds.length === 0) {
        return { warnings: [] };
      }
      
      // Check interactions between all compositions in this medication
      try {
        const result = await post(API_ENDPOINTS.DDI_CHECK_COMPOSITIONS, { 
          compositionIds 
        });
        return result;
      } catch (error) {
        console.error('DDI check error:', error);
        // If error, return empty warnings instead of failing
        return { warnings: [] };
      }
    },
    enabled: !!medication && compositionIds.length >= 2, // Only check if 2+ compositions
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

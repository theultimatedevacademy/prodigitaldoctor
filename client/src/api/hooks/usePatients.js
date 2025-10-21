/**
 * Patient API hooks using React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, patch, del } from '../apiClient';
import { API_ENDPOINTS, QUERY_KEYS } from '../../utils/constants';
/**
 * Hook to fetch list of patients for a clinic
 * @param {string} clinicId - Clinic ID
 * @param {object} filtersOrOptions - Query filters (search, page, limit) or options object
 * @returns {object} Query result with patients data
 */
export function usePatients(clinicId, filtersOrOptions = {}) {
  // Separate filters from React Query options
  const { enabled, limit, page, search, ...otherFilters } = filtersOrOptions;
  
  // Build filters object, excluding undefined values
  const filters = {};
  if (clinicId) filters.clinicId = clinicId;
  if (limit !== undefined) filters.limit = limit;
  if (page !== undefined) filters.page = page;
  if (search !== undefined && search !== '') filters.search = search;
  
  // Add any other filters
  Object.keys(otherFilters).forEach(key => {
    if (otherFilters[key] !== undefined) {
      filters[key] = otherFilters[key];
    }
  });
  
  const params = new URLSearchParams(filters).toString();
  
  return useQuery({
    queryKey: [...QUERY_KEYS.PATIENTS, clinicId, filters],
    queryFn: () => get(`${API_ENDPOINTS.PATIENTS}?${params}`),
    enabled: enabled !== undefined ? enabled : !!clinicId, // Use provided enabled or default
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a single patient by ID
 * @param {string} patientId - Patient ID
 * @returns {object} Query result with patient data
 */
export function usePatient(patientId) {
  return useQuery({
    queryKey: QUERY_KEYS.PATIENT(patientId),
    queryFn: () => get(API_ENDPOINTS.PATIENT_BY_ID(patientId)),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new patient
 * @returns {object} Mutation object
 */
export function useCreatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (patientData) => post(API_ENDPOINTS.PATIENTS, patientData),
    onSuccess: (data, variables) => {
      // Invalidate patients list for the clinic
      queryClient.invalidateQueries({
        queryKey: [...QUERY_KEYS.PATIENTS, variables.clinicId],
      });
    },
  });
}

/**
 * Hook to update a patient
 * @returns {object} Mutation object
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ patientId, data }) => patch(API_ENDPOINTS.PATIENT_BY_ID(patientId), data),
    onSuccess: (data, variables) => {
      // Invalidate specific patient and patients list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PATIENT(variables.patientId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PATIENTS,
      });
    },
  });
}

/**
 * Hook to delete a patient
 * @returns {object} Mutation object
 */
export function useDeletePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (patientId) => del(API_ENDPOINTS.PATIENT_BY_ID(patientId)),
    onSuccess: (data, patientId) => {
      // Remove from cache and invalidate list
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.PATIENT(patientId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PATIENTS,
      });
    },
  });
}

/**
 * Hook to search patients
 * @param {string} query - Search query
 * @param {string} clinicId - Clinic ID
 * @returns {object} Query result with search results
 */
export function useSearchPatients(query, clinicId) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PATIENTS, 'search', query, clinicId],
    queryFn: () => get(`${API_ENDPOINTS.PATIENTS}/search?q=${query}&clinic=${clinicId}`),
    enabled: !!query && query.length >= 2 && !!clinicId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

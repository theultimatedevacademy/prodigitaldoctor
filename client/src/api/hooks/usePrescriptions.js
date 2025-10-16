/**
 * Prescription API hooks using React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '../apiClient';
import { API_ENDPOINTS, QUERY_KEYS } from '../../utils/constants';

/**
 * Hook to fetch prescriptions with filters
 * @param {object} filters - Query filters (clinicId, doctorId, patientId)
 * @param {object} options - React Query options (enabled, etc.)
 * @returns {object} Query result with prescriptions data
 */
export function usePrescriptions(filters = {}, options = {}) {
  const params = new URLSearchParams(filters).toString();
  
  return useQuery({
    queryKey: [...QUERY_KEYS.PRESCRIPTIONS, filters],
    queryFn: () => get(`${API_ENDPOINTS.PRESCRIPTIONS}?${params}`),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options, // Allow overriding options like enabled
  });
}

/**
 * Hook to fetch a single prescription by ID
 * @param {string} prescriptionId - Prescription ID
 * @returns {object} Query result with prescription data
 */
export function usePrescription(prescriptionId) {
  return useQuery({
    queryKey: QUERY_KEYS.PRESCRIPTION(prescriptionId),
    queryFn: () => get(API_ENDPOINTS.PRESCRIPTION_BY_ID(prescriptionId)),
    enabled: !!prescriptionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new prescription
 * @returns {object} Mutation object
 */
export function useCreatePrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (prescriptionData) => post(API_ENDPOINTS.PRESCRIPTIONS, prescriptionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRESCRIPTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

/**
 * Hook to update a prescription
 * @returns {object} Mutation object
 */
export function useUpdatePrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ prescriptionId, data }) => put(API_ENDPOINTS.PRESCRIPTION_BY_ID(prescriptionId), data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRESCRIPTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRESCRIPTION(variables.prescriptionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

/**
 * Hook to delete a prescription
 * @returns {object} Mutation object
 */
export function useDeletePrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (prescriptionId) => del(API_ENDPOINTS.PRESCRIPTION_BY_ID(prescriptionId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRESCRIPTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

/**
 * Hook to check drug-drug interactions by composition IDs
 * @returns {object} Mutation object
 */
export function useCheckDDI() {
  return useMutation({
    mutationFn: (compositionIds) => post(API_ENDPOINTS.DDI_CHECK_COMPOSITIONS, { compositionIds }),
  });
}

/**
 * Hook to share prescription via ABDM
 * @returns {object} Mutation object
 */
export function useShareABDM() {
  return useMutation({
    mutationFn: ({ prescriptionId, abhaId }) => 
      post(API_ENDPOINTS.ABDM_SHARE, { prescriptionId, abhaId }),
  });
}

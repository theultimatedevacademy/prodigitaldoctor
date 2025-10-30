/**
 * Prescription API hooks using React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, patch, del } from '../apiClient';
import { API_ENDPOINTS, QUERY_KEYS, STALE_TIMES } from '../../utils/constants';

/**
 * Hook to fetch prescriptions with filters
 * @param {object} filters - Query filters (clinicId, doctorId, patientId, startDate, endDate)
 * @param {object} options - React Query options (enabled, etc.)
 * @returns {object} Query result with prescriptions data
 */
export function usePrescriptions(filters = {}, options = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PRESCRIPTIONS, filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      return get(`${API_ENDPOINTS.PRESCRIPTIONS}?${params.toString()}`);
    },
    staleTime: STALE_TIMES.MEDIUM, // 2 minutes
    ...options,
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
    staleTime: STALE_TIMES.LONG, // 5 minutes
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
 * Hook to fetch prescription PDF data
 * @param {string} prescriptionId - Prescription ID
 * @returns {object} Query result with PDF data
 */
export function usePrescriptionPDFData(prescriptionId) {
  return useQuery({
    queryKey: QUERY_KEYS.PRESCRIPTION_PDF_DATA(prescriptionId),
    queryFn: () => get(API_ENDPOINTS.PRESCRIPTION_PDF_DATA(prescriptionId)),
    enabled: !!prescriptionId,
    staleTime: STALE_TIMES.LONG, // 5 minutes
  });
}

/**
 * Hook to update prescription PDF URL after upload
 * @returns {object} Mutation object
 */
export function useUpdatePrescriptionPDF() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ prescriptionId, pdfUrl, pdfS3Key }) => 
      patch(API_ENDPOINTS.PRESCRIPTION_PDF(prescriptionId), { pdfUrl, pdfS3Key }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRESCRIPTION(variables.prescriptionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRESCRIPTIONS });
    },
  });
}

export default {
  usePrescriptions,
  usePrescription,
  useCreatePrescription,
  useUpdatePrescription,
  useDeletePrescription,
  usePrescriptionPDFData,
  useUpdatePrescriptionPDF,
};

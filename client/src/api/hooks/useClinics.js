/**
 * Clinic API hooks using React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '../apiClient';
import { API_ENDPOINTS, QUERY_KEYS } from '../../utils/constants';

/**
 * Hook to fetch list of clinics for current user
 * @returns {object} Query result with clinics data
 */
export function useClinics() {
  return useQuery({
    queryKey: QUERY_KEYS.CLINICS,
    queryFn: () => get(API_ENDPOINTS.CLINICS),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single clinic by ID
 * @param {string} clinicId - Clinic ID
 * @returns {object} Query result with clinic data
 */
export function useClinic(clinicId) {
  return useQuery({
    queryKey: QUERY_KEYS.CLINIC(clinicId),
    queryFn: () => get(API_ENDPOINTS.CLINIC_BY_ID(clinicId)),
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new clinic
 * @returns {object} Mutation object
 */
export function useCreateClinic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (clinicData) => post(API_ENDPOINTS.CLINICS, clinicData),
    onSuccess: () => {
      // Invalidate clinics list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLINICS });
      // Invalidate user data to refresh roles (doctor -> clinic_owner)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME });
    },
  });
}

/**
 * Hook to update a clinic
 * @returns {object} Mutation object
 */
export function useUpdateClinic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ clinicId, data }) => put(API_ENDPOINTS.CLINIC_BY_ID(clinicId), data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLINIC(variables.clinicId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLINICS });
    },
  });
}

/**
 * Hook to delete a clinic
 * @returns {object} Mutation object
 */
export function useDeleteClinic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (clinicId) => del(API_ENDPOINTS.CLINIC_BY_ID(clinicId)),
    onSuccess: (data, clinicId) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.CLINIC(clinicId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLINICS });
    },
  });
}

/**
 * Hook to fetch doctors for a clinic
 * @param {string} clinicId - Clinic ID
 * @returns {object} Query result with doctors data
 */
export function useClinicDoctors(clinicId) {
  return useQuery({
    queryKey: ['clinic-doctors', clinicId],
    queryFn: () => get(`/api/clinics/${clinicId}/doctors`),
    enabled: !!clinicId && clinicId !== 'null' && clinicId !== 'undefined',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

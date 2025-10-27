/**
 * Patient API Hooks
 * Handles patient CRUD operations and search
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '../apiClient';
import { API_ENDPOINTS, QUERY_KEYS, STALE_TIMES } from '../../utils/constants';

/**
 * Hook to fetch patients for a clinic with optional filters
 * @param {object} filters - { clinicId, search, gender, minAge, maxAge }
 * @returns {object} Query result with patients array
 */
export function usePatients(filters = {}) {
  const { clinicId, search, gender, minAge, maxAge } = filters;

  return useQuery({
    queryKey: QUERY_KEYS.PATIENTS(clinicId, { search, gender, minAge, maxAge }),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (clinicId) params.append('clinicId', clinicId);
      if (search) params.append('search', search);
      if (gender) params.append('gender', gender);
      if (minAge) params.append('minAge', minAge);
      if (maxAge) params.append('maxAge', maxAge);

      const queryString = params.toString();
      const url = queryString ? `${API_ENDPOINTS.PATIENTS}?${queryString}` : API_ENDPOINTS.PATIENTS;
      
      const response = await get(url);
      
      // Debug logging
      console.log('=== usePatients API Response ===');
      console.log('URL:', url);
      console.log('Response:', JSON.stringify(response, null, 2));
      console.log('Response.patients length:', response?.patients?.length);
      console.log('Response.pagination:', response?.pagination);
      console.log('Response.pagination.total:', response?.pagination?.total);
      console.log('================================');
      
      return response;
    },
    enabled: !!clinicId, // Only fetch if clinicId is provided
    staleTime: STALE_TIMES.MEDIUM, // 2 minutes
    // Backend returns { patients: [...], pagination: { total, page, limit, pages } }
    // Return the full data object so consumers can access both patients and pagination
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
    staleTime: STALE_TIMES.MEDIUM, // 2 minutes
    // Backend returns patient object directly
  });
}

/**
 * Hook to search patients for appointment booking
 * @param {string} query - Search query
 * @param {string} clinicId - Clinic ID
 * @returns {object} Query result with patients array
 */
export function useSearchPatientsForAppointment(query, clinicId) {
  return useQuery({
    queryKey: QUERY_KEYS.SEARCH_PATIENTS(query, clinicId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (clinicId) params.append('clinicId', clinicId);
      
      return get(`${API_ENDPOINTS.SEARCH_PATIENTS_FOR_APPOINTMENT}?${params.toString()}`);
    },
    enabled: !!query && query.length >= 2, // Only search if query is at least 2 characters
    staleTime: STALE_TIMES.SHORT, // 30 seconds
    select: (data) => {
      return data?.patients || data || [];
    },
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
      if (variables.clinic) {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.PATIENTS(variables.clinic) 
        });
      }
      
      // Invalidate all patients queries
      queryClient.invalidateQueries({ queryKey: ['patients'] });

      if (__DEV__) {
        console.log('✅ Patient created successfully');
      }
    },
    onError: (error) => {
      console.error('Error creating patient:', error);
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
    mutationFn: ({ patientId, ...patientData }) => 
      patch(API_ENDPOINTS.PATIENT_BY_ID(patientId), patientData),
    onSuccess: (data, variables) => {
      // Invalidate specific patient
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.PATIENT(variables.patientId) 
      });
      
      // Invalidate patients list
      queryClient.invalidateQueries({ queryKey: ['patients'] });

      if (__DEV__) {
        console.log('✅ Patient updated successfully');
      }
    },
    onError: (error) => {
      console.error('Error updating patient:', error);
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
      // Remove from cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.PATIENT(patientId) });
      
      // Invalidate patients list
      queryClient.invalidateQueries({ queryKey: ['patients'] });

      if (__DEV__) {
        console.log('✅ Patient deleted successfully');
      }
    },
    onError: (error) => {
      console.error('Error deleting patient:', error);
    },
  });
}

/**
 * Hook to get patient history (appointments, prescriptions)
 * @param {string} patientId - Patient ID
 * @returns {object} Query result with history data
 */
export function usePatientHistory(patientId) {
  return useQuery({
    queryKey: QUERY_KEYS.PATIENT_HISTORY(patientId),
    queryFn: () => get(`${API_ENDPOINTS.PATIENT_BY_ID(patientId)}/history`),
    enabled: !!patientId,
    staleTime: STALE_TIMES.SHORT, // 30 seconds - history changes frequently
  });
}

export default {
  usePatients,
  usePatient,
  useSearchPatientsForAppointment,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
  usePatientHistory,
};

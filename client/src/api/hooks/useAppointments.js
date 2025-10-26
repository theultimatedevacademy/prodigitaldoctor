/**
 * Appointment API hooks using React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '../apiClient';
import { API_ENDPOINTS, QUERY_KEYS } from '../../utils/constants';

/**
 * Hook to fetch appointments with filters
 * @param {object} filters - Query filters (clinicId, doctorId, patientId, date, status)
 * @param {object} options - React Query options (enabled, etc.)
 * @returns {object} Query result with appointments data
 */
export function useAppointments(filters = {}, options = {}) {
  const params = new URLSearchParams(filters).toString();
  
  return useQuery({
    queryKey: [...QUERY_KEYS.APPOINTMENTS, filters],
    queryFn: () => get(`${API_ENDPOINTS.APPOINTMENTS}?${params}`),
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options, // Allow overriding options like enabled
  });
}

/**
 * Hook to fetch a single appointment by ID
 * @param {string} appointmentId - Appointment ID
 * @returns {object} Query result with appointment data
 */
export function useAppointment(appointmentId) {
  return useQuery({
    queryKey: QUERY_KEYS.APPOINTMENT(appointmentId),
    queryFn: () => get(API_ENDPOINTS.APPOINTMENT_BY_ID(appointmentId)),
    enabled: !!appointmentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to create a new appointment
 * @returns {object} Mutation object
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (appointmentData) => post(API_ENDPOINTS.APPOINTMENTS, appointmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

/**
 * Hook to update an appointment
 * @returns {object} Mutation object
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ appointmentId, data }) => patch(API_ENDPOINTS.APPOINTMENT_BY_ID(appointmentId), data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENT(variables.appointmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

/**
 * Hook to cancel/delete an appointment
 * @returns {object} Mutation object
 */
export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (appointmentId) => del(API_ENDPOINTS.APPOINTMENT_BY_ID(appointmentId)),
    onSuccess: (data, appointmentId) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.APPOINTMENT(appointmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

/**
 * Hook to create a first visit appointment
 * @returns {object} Mutation object
 */
export function useCreateFirstVisitAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (appointmentData) => post('/appointments/first-visit', appointmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PATIENTS });
    },
  });
}

/**
 * Hook to create a follow-up appointment
 * @returns {object} Mutation object
 */
export function useCreateFollowUpAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (appointmentData) => post('/appointments/follow-up', appointmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

/**
 * Hook to update appointment vitals (auto-changes status to in-progress)
 * @returns {object} Mutation object
 */
export function useUpdateAppointmentVitals() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ appointmentId, vitals }) => 
      patch(`/appointments/${appointmentId}/vitals`, vitals),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENT(variables.appointmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

/**
 * Hook to update appointment clinical notes
 * @returns {object} Mutation object
 */
export function useUpdateClinicalNotes() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ appointmentId, clinicalNotes }) => 
      patch(`/appointments/${appointmentId}/clinical-notes`, clinicalNotes),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENT(variables.appointmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

/**
 * Hook to manually update appointment status
 * @returns {object} Mutation object
 */
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ appointmentId, status }) => 
      patch(`/appointments/${appointmentId}/status`, { status }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENT(variables.appointmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

/**
 * Hook to assign doctor to appointment
 * @returns {object} Mutation object
 */
export function useAssignDoctorToAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ appointmentId, doctorId }) => 
      patch(`/appointments/${appointmentId}/assign-doctor`, { doctorId }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENT(variables.appointmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

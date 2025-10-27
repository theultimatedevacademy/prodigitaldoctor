/**
 * Appointment API Hooks
 * Handles appointment management, vitals, clinical notes, and calendar views
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch } from '../apiClient';
import { API_ENDPOINTS, QUERY_KEYS, STALE_TIMES } from '../../utils/constants';

/**
 * Hook to fetch appointments with filters
 * @param {object} filters - Query filters (clinicId, doctorId, patientId, date, status)
 * @param {object} options - React Query options (enabled, etc.)
 * @returns {object} Query result with appointments data
 */
export function useAppointments(filters = {}, options = {}) {
  // Build query string from filters
  const queryString = new URLSearchParams(
    Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {})
  ).toString();

  return useQuery({
    queryKey: [...QUERY_KEYS.APPOINTMENTS, filters],
    queryFn: () => {
      const url = queryString ? `${API_ENDPOINTS.APPOINTMENTS}?${queryString}` : API_ENDPOINTS.APPOINTMENTS;
      return get(url);
    },
    staleTime: STALE_TIMES.SHORT, // 1 minute
    ...options,
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
    staleTime: STALE_TIMES.MEDIUM, // 2 minutes
  });
}

/**
 * Hook to create a first visit appointment with temp patient data
 * Smart patient matching handled by backend
 * @returns {object} Mutation object
 */
export function useCreateFirstVisitAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentData) => post(API_ENDPOINTS.FIRST_VISIT_APPOINTMENT, appointmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PATIENTS });
    },
  });
}

/**
 * Hook to create a follow-up appointment with existing patient
 * @returns {object} Mutation object
 */
export function useCreateFollowUpAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentData) => post(API_ENDPOINTS.FOLLOW_UP_APPOINTMENT, appointmentData),
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
    mutationFn: ({ appointmentId, data }) => 
      patch(API_ENDPOINTS.APPOINTMENT_BY_ID(appointmentId), data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENT(variables.appointmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

/**
 * Hook to cancel an appointment
 * POST /appointments/:id/cancel
 * @returns {object} Mutation object
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, reason }) => 
      post(API_ENDPOINTS.APPOINTMENT_CANCEL(appointmentId), { reason }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENT(variables.appointmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

/**
 * Hook to mark appointment as completed
 * POST /appointments/:id/complete
 * @returns {object} Mutation object
 */
export function useCompleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId) => 
      post(API_ENDPOINTS.APPOINTMENT_COMPLETE(appointmentId)),
    onSuccess: (data, appointmentId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENT(appointmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

/**
 * Hook to update appointment vitals
 * Auto-changes status to 'in-progress'
 * PATCH /appointments/:id/vitals
 * @returns {object} Mutation object
 */
export function useUpdateAppointmentVitals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, vitals }) => 
      patch(API_ENDPOINTS.APPOINTMENT_VITALS(appointmentId), vitals),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENT(variables.appointmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

/**
 * Hook to update appointment clinical notes
 * PATCH /appointments/:id/clinical-notes
 * @returns {object} Mutation object
 */
export function useUpdateClinicalNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, clinicalNotes }) => 
      patch(API_ENDPOINTS.APPOINTMENT_CLINICAL_NOTES(appointmentId), clinicalNotes),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENT(variables.appointmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

/**
 * Hook to manually update appointment status
 * PATCH /appointments/:id/status
 * @returns {object} Mutation object
 */
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, status }) => 
      patch(API_ENDPOINTS.APPOINTMENT_STATUS(appointmentId), { status }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENT(variables.appointmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

/**
 * Hook to assign doctor to appointment
 * PATCH /appointments/:id/assign-doctor
 * @returns {object} Mutation object
 */
export function useAssignDoctorToAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, doctorId }) => 
      patch(API_ENDPOINTS.APPOINTMENT_ASSIGN_DOCTOR(appointmentId), { doctorId }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENT(variables.appointmentId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS });
    },
  });
}

/**
 * Hook to fetch calendar view for doctor
 * GET /appointments/calendar?doctor=xxx&startDate=xxx&endDate=xxx
 * @param {string} doctorId - Doctor ID
 * @param {string} startDate - Start date (ISO string)
 * @param {string} endDate - End date (ISO string)
 * @param {string} clinicId - Optional clinic ID filter
 * @returns {object} Query result with calendar data
 */
export function useCalendarView(doctorId, startDate, endDate, clinicId) {
  const params = new URLSearchParams({
    doctor: doctorId,
    startDate,
    endDate,
    ...(clinicId && { clinic: clinicId }),
  }).toString();

  return useQuery({
    queryKey: [...QUERY_KEYS.APPOINTMENTS, 'calendar', doctorId, startDate, endDate, clinicId],
    queryFn: () => get(`${API_ENDPOINTS.APPOINTMENT_CALENDAR}?${params}`),
    enabled: !!doctorId && !!startDate && !!endDate,
    staleTime: STALE_TIMES.SHORT, // 1 minute
  });
}

/**
 * Hook to search patients for appointment booking
 * Searches by patient code or phone number
 * Only returns patients with completed visits in the clinic
 * @param {string} query - Search query (min 2 chars)
 * @param {string} clinicId - Clinic ID
 * @returns {object} Query result with patients array
 */
export function useSearchPatientsForAppointment(query, clinicId, options = {}) {
  return useQuery({
    queryKey: ['search-patients-appointment', query, clinicId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (clinicId) params.append('clinicId', clinicId);
      return get(`${API_ENDPOINTS.SEARCH_PATIENTS_FOR_APPOINTMENT}?${params.toString()}`);
    },
    enabled: !!query && query.length >= 2 && !!clinicId,
    staleTime: STALE_TIMES.SHORT, // 1 minute
    ...options,
  });
}

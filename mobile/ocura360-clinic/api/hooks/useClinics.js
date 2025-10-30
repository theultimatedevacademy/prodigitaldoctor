/**
 * Clinic API Hooks
 * Handles clinic CRUD operations and staff management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '../apiClient';
import { API_ENDPOINTS, QUERY_KEYS, STALE_TIMES } from '../../utils/constants';

/**
 * Hook to fetch all clinics for current user
 * Returns both owned clinics and clinics where user is staff
 * @returns {object} Query result with clinics array
 */
export function useClinics() {
  return useQuery({
    queryKey: QUERY_KEYS.CLINICS,
    queryFn: async () => {
      try {
        return await get(API_ENDPOINTS.CLINICS);
      } catch (error) {
        // Handle 404 gracefully - user might not exist in DB yet or have no clinics
        if (error.status === 404) {
          console.log('ℹ️ User has no clinics yet or user not found in database');
          return { clinics: [], total: 0 };
        }
        throw error;
      }
    },
    staleTime: STALE_TIMES.MEDIUM, // 2 minutes
    select: (data) => {
      // Backend returns object with clinics array: { clinics: [...], total: N }
      const clinicsArray = data?.clinics || data || [];
      
      // Ensure we have an array
      if (!Array.isArray(clinicsArray)) {
        console.warn('Clinics data is not an array:', clinicsArray);
        return [];
      }
      
      // Transform to include role information
      return clinicsArray.map(clinic => ({
        ...clinic,
        userRole: clinic.userRole || 'staff', // Fallback to staff if not specified
      }));
    },
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
    staleTime: STALE_TIMES.LONG, // 5 minutes
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
    onSuccess: (newClinic) => {
      // Add new clinic to cache
      queryClient.setQueryData(QUERY_KEYS.CLINICS, (old) => {
        return old ? [...old, { ...newClinic, userRole: 'clinic_owner' }] : [{ ...newClinic, userRole: 'clinic_owner' }];
      });

      // Invalidate clinics list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLINICS });

      if (__DEV__) {
        console.log('✅ Clinic created successfully');
      }
    },
    onError: (error) => {
      console.error('Error creating clinic:', error);
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
    mutationFn: ({ clinicId, data }) => patch(API_ENDPOINTS.CLINIC_BY_ID(clinicId), data),
    onSuccess: (updatedClinic, variables) => {
      // Update clinic in cache
      queryClient.setQueryData(QUERY_KEYS.CLINIC(variables.clinicId), updatedClinic);

      // Update clinic in clinics list
      queryClient.setQueryData(QUERY_KEYS.CLINICS, (old) => {
        return old?.map(clinic => 
          clinic._id === variables.clinicId ? { ...updatedClinic, userRole: clinic.userRole } : clinic
        );
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLINIC(variables.clinicId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLINICS });

      if (__DEV__) {
        console.log('✅ Clinic updated successfully');
      }
    },
    onError: (error) => {
      console.error('Error updating clinic:', error);
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
      // Remove clinic from cache
      queryClient.setQueryData(QUERY_KEYS.CLINICS, (old) => {
        return old?.filter(clinic => clinic._id !== clinicId);
      });

      // Remove clinic query
      queryClient.removeQueries({ queryKey: QUERY_KEYS.CLINIC(clinicId) });

      // Invalidate clinics list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLINICS });

      if (__DEV__) {
        console.log('✅ Clinic deleted successfully');
      }
    },
    onError: (error) => {
      console.error('Error deleting clinic:', error);
    },
  });
}

/**
 * Hook to invite staff to a clinic
 * @returns {object} Mutation object
 */
export function useInviteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clinicId, email, role }) => 
      post(API_ENDPOINTS.INVITE_STAFF(clinicId), { email, role }),
    onSuccess: (data, variables) => {
      // Invalidate clinic to refresh staff list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLINIC(variables.clinicId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PENDING_INVITATIONS });

      if (__DEV__) {
        console.log('✅ Staff invitation sent successfully');
      }
    },
    onError: (error) => {
      console.error('Error inviting staff:', error);
    },
  });
}

/**
 * Hook to accept a clinic invitation
 * @returns {object} Mutation object
 */
export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clinicId) => post(API_ENDPOINTS.ACCEPT_INVITATION(clinicId), {}),
    onSuccess: (data, clinicId) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PENDING_INVITATIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLINICS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLINIC(clinicId) });

      if (__DEV__) {
        console.log('✅ Invitation accepted successfully');
      }
    },
    onError: (error) => {
      console.error('Error accepting invitation:', error);
    },
  });
}

/**
 * Hook to reject a clinic invitation
 * @returns {object} Mutation object
 */
export function useRejectInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clinicId) => post(API_ENDPOINTS.REJECT_INVITATION(clinicId), {}),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PENDING_INVITATIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLINICS });

      if (__DEV__) {
        console.log('✅ Invitation rejected successfully');
      }
    },
    onError: (error) => {
      console.error('Error rejecting invitation:', error);
    },
  });
}

/**
 * Hook to remove staff from a clinic
 * @returns {object} Mutation object
 */
export function useRemoveStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clinicId, userId }) => 
      del(API_ENDPOINTS.REMOVE_STAFF(clinicId, userId)),
    onSuccess: (data, variables) => {
      // Invalidate clinic to refresh staff list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CLINIC(variables.clinicId) });

      if (__DEV__) {
        console.log('✅ Staff member removed successfully');
      }
    },
    onError: (error) => {
      console.error('Error removing staff:', error);
    },
  });
}

/**
 * Hook to get pending invitations for current user (all clinics)
 * @returns {object} Query result with pending invitations
 */
export function usePendingInvitations() {
  return useQuery({
    queryKey: QUERY_KEYS.PENDING_INVITATIONS,
    queryFn: () => get(API_ENDPOINTS.PENDING_INVITATIONS),
    staleTime: STALE_TIMES.SHORT, // 30 seconds - invitations change frequently
  });
}

/**
 * Hook to fetch doctors for a clinic
 * Returns clinic owner (always a doctor) + staff doctors
 * @param {string} clinicId - Clinic ID
 * @returns {object} Query result with doctors array
 */
export function useClinicDoctors(clinicId) {
  return useQuery({
    queryKey: ['clinic-doctors', clinicId],
    queryFn: () => get(`/clinics/${clinicId}/doctors`),
    enabled: !!clinicId && clinicId !== 'null' && clinicId !== 'undefined',
    staleTime: STALE_TIMES.LONG, // 5 minutes
  });
}

export default {
  useClinics,
  useClinic,
  useCreateClinic,
  useUpdateClinic,
  useDeleteClinic,
  useInviteStaff,
  useAcceptInvitation,
  useRejectInvitation,
  useRemoveStaff,
  usePendingInvitations,
  useClinicDoctors,
};

/**
 * Invitations API hooks
 * Handles clinic invitations (view, accept, reject)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../apiClient';
import { toast } from 'react-toastify';

const ENDPOINTS = {
  PENDING_INVITATIONS: '/auth/invitations/pending',
  ACCEPT_INVITE: (clinicId) => `/clinics/${clinicId}/accept-invite`,
  REJECT_INVITE: (clinicId) => `/clinics/${clinicId}/reject-invite`,
};

/**
 * Get pending invitations for current user
 */
export function usePendingInvitations() {
  return useQuery({
    queryKey: ['invitations', 'pending'],
    queryFn: () => get(ENDPOINTS.PENDING_INVITATIONS),
  });
}

/**
 * Accept invitation
 */
export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clinicId) => post(ENDPOINTS.ACCEPT_INVITE(clinicId), {}),
    onSuccess: (data, clinicId) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'my-clinics'] });
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      queryClient.invalidateQueries({ queryKey: ['clinic', clinicId] });
      
      toast.success('Invitation accepted! You now have access to the clinic.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to accept invitation');
    },
  });
}

/**
 * Reject invitation
 */
export function useRejectInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clinicId) => post(ENDPOINTS.REJECT_INVITE(clinicId), {}),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation rejected');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject invitation');
    },
  });
}

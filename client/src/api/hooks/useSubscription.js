/**
 * Subscription API hooks
 * Handles subscription management, trial activation, and plan upgrades
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../apiClient';
import { toast } from 'react-toastify';

const ENDPOINTS = {
  SUBSCRIPTION_INFO: '/subscription/info',
  SUBSCRIPTION_PLANS: '/subscription/plans',
  START_TRIAL: '/subscription/start-trial',
  UPGRADE: '/subscription/upgrade',
  CANCEL: '/subscription/cancel',
};

/**
 * Get user's subscription info
 */
export function useSubscriptionInfo() {
  return useQuery({
    queryKey: ['subscription', 'info'],
    queryFn: () => get(ENDPOINTS.SUBSCRIPTION_INFO),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get available subscription plans
 */
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: () => get(ENDPOINTS.SUBSCRIPTION_PLANS),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Start free trial
 */
export function useStartTrial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => post(ENDPOINTS.START_TRIAL, {}),
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Free trial activated! You can now create your first clinic.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start trial');
    },
  });
}

/**
 * Upgrade subscription
 */
export function useUpgradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plan, paymentToken }) =>
      post(ENDPOINTS.UPGRADE, { plan, paymentToken }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Subscription upgraded successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upgrade subscription');
    },
  });
}

/**
 * Cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => post(ENDPOINTS.CANCEL, {}),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription cancelled');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel subscription');
    },
  });
}

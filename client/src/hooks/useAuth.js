/**
 * useAuth hook - Centralized auth logic with Clerk integration
 * Provides Clerk user, session token, and application user profile
 */

import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useMe } from '../api/hooks/useAuth';

/**
 * Custom hook for authentication
 * Combines Clerk auth with backend user profile
 * @returns {object} Auth state and helpers
 */
export function useAuth() {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const { getToken, signOut } = useClerkAuth();
  
  // Fetch backend user profile (only when Clerk is loaded and user is signed in)
  const { 
    data: backendUser, 
    isLoading: isUserLoading, 
    error: userError 
  } = useMe(isSignedIn, isClerkLoaded);
  
  /**
   * Get Clerk session token
   * @returns {Promise<string>} JWT token
   */
  const getAuthToken = async () => {
    try {
      const token = await getToken();
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };
  
  /**
   * Sign out user
   */
  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  /**
   * Check if user has a specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has role
   */
  const hasRole = (role) => {
    if (!backendUser?.roles) return false;
    return Array.isArray(backendUser.roles) && backendUser.roles.includes(role);
  };
  
  /**
   * Check if user is a doctor
   * @returns {boolean} True if user is a doctor
   */
  const isDoctor = () => hasRole('doctor');
  
  /**
   * Check if user is a patient
   * @returns {boolean} True if user is a patient
   */
  const isPatient = () => hasRole('patient');
  
  /**
   * Check if user is staff (assistant)
   * @returns {boolean} True if user is staff
   */
  const isStaff = () => hasRole('assistant');
  
  /**
   * Check if user is admin
   * @returns {boolean} True if user is admin
   */
  const isAdmin = () => hasRole('admin');
  
  /**
   * Check if user is a clinic owner
   * @returns {boolean} True if user is a clinic owner
   */
  const isClinicOwner = () => hasRole('clinic_owner');
  
  return {
    // Clerk user data
    clerkUser,
    isSignedIn,
    
    // Backend user profile
    user: backendUser,
    
    // Loading states
    isLoading: !isClerkLoaded || isUserLoading,
    isAuthenticated: isSignedIn && !!backendUser,
    
    // Error state
    error: userError,
    
    // Helper methods
    getAuthToken,
    signOut: handleSignOut,
    hasRole,
    isDoctor,
    isPatient,
    isStaff,
    isAdmin,
    isClinicOwner,
  };
}

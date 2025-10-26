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
   * Check if user is clinic owner in a specific clinic
   * @param {string} clinicId - Clinic ID
   * @returns {boolean} True if user is owner
   */
  const isClinicOwner = (clinicId) => {
    if (!backendUser?.clinics || !clinicId) return false;
    const clinic = backendUser.clinics.find(c => c._id === clinicId);
    return clinic?.userRole === 'clinic_owner';
  };

  /**
   * Check if user is doctor in a specific clinic
   * @param {string} clinicId - Clinic ID
   * @returns {boolean} True if user is doctor
   */
  const isDoctor = (clinicId) => {
    if (!backendUser?.clinics || !clinicId) return false;
    const clinic = backendUser.clinics.find(c => c._id === clinicId);
    return clinic?.userRole === 'doctor';
  };

  /**
   * Check if user is staff in a specific clinic
   * @param {string} clinicId - Clinic ID
   * @returns {boolean} True if user is staff
   */
  const isStaff = (clinicId) => {
    if (!backendUser?.clinics || !clinicId) return false;
    const clinic = backendUser.clinics.find(c => c._id === clinicId);
    return clinic?.userRole === 'staff';
  };

  /**
   * Get user's role in a specific clinic
   * @param {string} clinicId - Clinic ID
   * @returns {string|null} 'clinic_owner' | 'doctor' | 'staff' | null
   */
  const getClinicRole = (clinicId) => {
    if (!backendUser?.clinics || !clinicId) return null;
    const clinic = backendUser.clinics.find(c => c._id === clinicId);
    return clinic?.userRole || null;
  };

  /**
   * Check if user can create clinic based on subscription
   * @returns {boolean} True if user can create clinic
   */
  const canCreateClinic = () => {
    return backendUser?.canCreateClinic || false;
  };

  /**
   * Check if user has any clinics
   * @returns {boolean} True if user has at least one clinic
   */
  const hasClinics = () => {
    return backendUser?.clinics && backendUser.clinics.length > 0;
  };
  
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
    
    // Clinic-specific role helpers
    getClinicRole,
    isClinicOwner,
    isDoctor,
    isStaff,
    
    // Subscription helpers
    canCreateClinic,
    hasClinics,
  };
}

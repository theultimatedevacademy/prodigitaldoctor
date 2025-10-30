import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@clerk/clerk-expo';
import { useClinics } from '../api/hooks/useClinics';
import { useAuthStatus } from '../api/hooks/useAuth';

const ClinicContext = createContext(undefined);

const STORAGE_KEY = '@selectedClinicId';

/**
 * ClinicProvider
 * Manages selected clinic and user's role in that clinic
 */
export function ClinicProvider({ children }) {
  const { user, isLoaded } = useUser();
  const { isAuthenticated } = useAuthStatus();
  const { data: clinics, isLoading: clinicsLoading, refetch: refetchClinics } = useClinics();
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [userClinicRole, setUserClinicRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize selected clinic when user data and clinics load
  useEffect(() => {
    initializeClinic();
  }, [user, isLoaded, clinics, isAuthenticated]);

  const initializeClinic = async () => {
    // Wait for Clerk to load and user to be authenticated
    if (!isLoaded || !isAuthenticated) {
      setIsLoading(true);
      return;
    }

    // Wait for clinics to load
    if (clinicsLoading || !clinics) {
      setIsLoading(true);
      return;
    }

    try {
      // No clinics available
      if (clinics.length === 0) {
        setSelectedClinic(null);
        setUserClinicRole(null);
        setIsLoading(false);
        return;
      }

      // Try to restore from AsyncStorage
      const storedClinicId = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (storedClinicId) {
        const clinic = clinics.find(c => c._id === storedClinicId);
        if (clinic) {
          setSelectedClinic(clinic);
          setUserClinicRole(clinic.userRole);
          setIsLoading(false);
          if (__DEV__) {
            console.log('✅ Restored clinic from storage:', clinic.name);
          }
          return;
        }
      }

      // Default to first available clinic
      const firstClinic = clinics[0];
      setSelectedClinic(firstClinic);
      setUserClinicRole(firstClinic.userRole);
      await AsyncStorage.setItem(STORAGE_KEY, firstClinic._id);
      
      if (__DEV__) {
        console.log('✅ Selected default clinic:', firstClinic.name);
      }
    } catch (error) {
      console.error('Error initializing clinic:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Switch to a different clinic
   * Validates that clinic exists in user's clinics list
   */
  const switchClinic = async (clinic) => {
    try {
      // Validate that clinic exists in user's clinics
      const clinicExists = clinics?.find(c => c._id === clinic._id);
      
      if (!clinicExists) {
        console.error('Clinic not found in user\'s clinics');
        return false;
      }

      setSelectedClinic(clinicExists);
      setUserClinicRole(clinicExists.userRole);
      await AsyncStorage.setItem(STORAGE_KEY, clinicExists._id);
      
      if (__DEV__) {
        console.log('✅ Switched to clinic:', clinicExists.name);
      }
      
      return true;
    } catch (error) {
      console.error('Error switching clinic:', error);
      return false;
    }
  };

  /**
   * Refresh clinics list from API
   */
  const refreshClinics = async () => {
    try {
      await refetchClinics();
      
      if (__DEV__) {
        console.log('✅ Clinics refreshed');
      }
      
      return true;
    } catch (error) {
      console.error('Error refreshing clinics:', error);
      return false;
    }
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role) => {
    return userClinicRole === role;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles) => {
    return roles.includes(userClinicRole);
  };

  const value = {
    selectedClinic,
    selectedClinicId: selectedClinic?._id,
    userClinicRole,
    isLoading,
    hasClinic: !!selectedClinic,
    clinics: clinics || [],
    clinicsCount: clinics?.length || 0,
    switchClinic,
    refreshClinics,
    hasRole,
    hasAnyRole,
  };

  return (
    <ClinicContext.Provider value={value}>
      {children}
    </ClinicContext.Provider>
  );
}

/**
 * Hook to use clinic context
 */
export function useClinicContext() {
  const context = useContext(ClinicContext);
  if (context === undefined) {
    throw new Error('useClinicContext must be used within a ClinicProvider');
  }
  return context;
}

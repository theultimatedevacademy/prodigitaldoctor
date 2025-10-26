/**
 * ClinicContext - Manages selected clinic and user's role in that clinic
 * Persists clinic selection to localStorage
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const ClinicContext = createContext(undefined);

const STORAGE_KEY = 'selectedClinicId';

export function ClinicProvider({ children }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [userClinicRole, setUserClinicRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize selected clinic when user data loads
  useEffect(() => {
    // Wait for auth to finish loading
    if (isAuthLoading) {
      setIsLoading(true);
      return;
    }

    // No user or no clinics
    if (!user?.clinics || user.clinics.length === 0) {
      setSelectedClinic(null);
      setUserClinicRole(null);
      setIsLoading(false);
      return;
    }

    // Try to restore from localStorage
    const storedClinicId = localStorage.getItem(STORAGE_KEY);
    
    if (storedClinicId) {
      const clinic = user.clinics.find(c => c._id === storedClinicId);
      if (clinic) {
        setSelectedClinic(clinic);
        setUserClinicRole(clinic.userRole);
        setIsLoading(false);
        return;
      }
    }

    // Default to first available clinic
    const firstClinic = user.clinics[0];
    setSelectedClinic(firstClinic);
    setUserClinicRole(firstClinic.userRole);
    localStorage.setItem(STORAGE_KEY, firstClinic._id);
    setIsLoading(false);
  }, [user, isAuthLoading]);

  /**
   * Switch to a different clinic
   * @param {Object} clinic - Clinic object with _id and userRole
   */
  const switchClinic = (clinic) => {
    setSelectedClinic(clinic);
    setUserClinicRole(clinic.userRole);
    localStorage.setItem(STORAGE_KEY, clinic._id);
  };

  /**
   * Clear selected clinic (on logout)
   */
  const clearClinic = () => {
    setSelectedClinic(null);
    setUserClinicRole(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = {
    selectedClinic,
    selectedClinicId: selectedClinic?._id || null,
    userClinicRole,
    switchClinic,
    clearClinic,
    isLoading,
    hasClinic: !!selectedClinic,
  };

  return (
    <ClinicContext.Provider value={value}>
      {children}
    </ClinicContext.Provider>
  );
}

/**
 * Hook to access clinic context
 */
export function useClinicContext() {
  const context = useContext(ClinicContext);
  if (context === undefined) {
    throw new Error('useClinicContext must be used within ClinicProvider');
  }
  return context;
}

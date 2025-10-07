import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * useClinicContext hook - Manages selected clinic context
 */

const ClinicContext = createContext(null);

/**
 * Clinic Context Provider
 * Manages the currently selected clinic across the application
 */
export function ClinicProvider({ children }) {
  const [selectedClinicId, setSelectedClinicId] = useState(() => {
    // Try to load from localStorage
    return localStorage.getItem("selectedClinicId") || null;
  });

  useEffect(() => {
    // Save to localStorage whenever it changes
    if (selectedClinicId) {
      localStorage.setItem("selectedClinicId", selectedClinicId);
    } else {
      localStorage.removeItem("selectedClinicId");
    }
  }, [selectedClinicId]);

  const value = {
    selectedClinicId,
    setSelectedClinicId,
  };

  return React.createElement(ClinicContext.Provider, { value }, children);
}

/**
 * Hook to access clinic context
 * @returns {object} Clinic context
 */
export function useClinicContext() {
  const context = useContext(ClinicContext);

  if (!context) {
    throw new Error("useClinicContext must be used within ClinicProvider");
  }

  return context;
}

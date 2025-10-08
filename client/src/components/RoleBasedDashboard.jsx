/**
 * RoleBasedDashboard Component
 * Routes users to appropriate dashboard based on their role
 * Shows role selection modal for new users
 */

import { useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { LoadingOverlay } from './ui/Spinner';
import { RoleSelectionModal } from './RoleSelectionModal';
import DoctorDashboard from '../pages/DoctorDashboard';
import PatientDashboard from '../pages/PatientDashboard';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../utils/constants';

export function RoleBasedDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const queryClient = useQueryClient();
  
  if (isLoading) {
    return <LoadingOverlay message="Loading your dashboard..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Check if user has no roles assigned - show role selection modal
  if (!user?.roles || user.roles.length === 0) {
    return (
      <RoleSelectionModal
        onRoleSelected={async () => {
          // Refetch user data after role selection
          await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME });
          // The component will re-render with updated user data
        }}
      />
    );
  }
  
  // Check user roles (user can have multiple roles)
  // Priority: doctor > clinic_owner > assistant > patient
  if (user.roles.includes('doctor') || user.roles.includes('clinic_owner')) {
    return <DoctorDashboard />;
  }
  
  if (user.roles.includes('assistant')) {
    return <DoctorDashboard />;
  }
  
  if (user.roles.includes('patient')) {
    return <PatientDashboard />;
  }
  
  // Fallback - should not reach here if role selection works correctly
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Unexpected Role
        </h2>
        <p className="text-gray-600">
          Your role is not recognized. Please contact support.
        </p>
      </div>
    </div>
  );
}

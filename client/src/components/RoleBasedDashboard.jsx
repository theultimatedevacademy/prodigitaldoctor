/**
 * RoleBasedDashboard Component
 * Routes users based on clinic access
 * Shows PendingUserDashboard for users with no clinic access
 */

import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useClinicContext } from "../contexts/ClinicContext";
import { LoadingOverlay } from "./ui/Spinner";
import { PendingUserDashboard } from "../pages/PendingUserDashboard";
import { MainLayout } from "../layouts/MainLayout";
import DoctorDashboard from "../pages/DoctorDashboard";

export function RoleBasedDashboard() {
  const { user, isLoading, isAuthenticated, hasClinics } = useAuth();
  const { hasClinic, isLoading: isClinicLoading } = useClinicContext();

  if (isLoading || isClinicLoading) {
    return <LoadingOverlay message="Loading your dashboard..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check if user has any clinics (owned or invited)
  if (!hasClinics() || !hasClinic) {
    // Show pending user onboarding dashboard
    return <PendingUserDashboard />;
  }

  // User has clinic access - show main dashboard with MainLayout
  // All roles (owner, doctor, staff) use same dashboard with different permissions
  return (
    <MainLayout>
      <DoctorDashboard />
    </MainLayout>
  );
}

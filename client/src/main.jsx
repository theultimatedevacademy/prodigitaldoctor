/**
 * Main Application Entry Point
 * Sets up providers, routing, and global configuration
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";

import {
  ClerkProvider,
  AuthenticateWithRedirectCallback,
} from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { ToastContainer } from "react-toastify";
import ErrorBoundary from "./ErrorBoundary";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleBasedDashboard } from "./components/RoleBasedDashboard";
import { ScrollToTop } from "./components/ScrollToTop";
import { ClinicProvider } from "./contexts/ClinicContext";
import { MainLayout } from "./layouts/MainLayout";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import { PendingUserDashboard } from "./pages/PendingUserDashboard";
import { StartTrialPage } from "./pages/StartTrialPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { StaffManagementPage } from "./pages/StaffManagementPage";
import PatientsPage from "./pages/PatientsPage";
import EditPatientPage from "./pages/EditPatientPage";
import PatientDetailPage from "./pages/PatientDetailPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import NewAppointmentPage from "./pages/NewAppointmentPage";
import AppointmentDetailPage from "./pages/AppointmentDetailPage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import NewPrescriptionPage from "./pages/NewPrescriptionPage";
import PrescriptionDetailPage from "./pages/PrescriptionDetailPage";
import MedicationsPage from "./pages/MedicationsPage";
import ClinicsPage from "./pages/ClinicsPage";
import NewClinicPage from "./pages/NewClinicPage";
import ClinicDetailPage from "./pages/ClinicDetailPage";
import { ClinicSettingsPage } from "./pages/ClinicSettingsPage";
import HelpPage from "./pages/HelpPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import ABDMCompliancePage from "./pages/ABDMCompliancePage";

// Analytics
import { initializeAnalytics } from "./utils/analytics";

// Get Clerk publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

// Initialize analytics on app load
initializeAnalytics();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <QueryClientProvider client={queryClient}>
          <ClinicProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
                <Route path="/abdm-compliance" element={<ABDMCompliancePage />} />

                {/* Clerk SSO Callback Routes */}
                <Route
                  path="/sso-callback"
                  element={<AuthenticateWithRedirectCallback />}
                />
                <Route
                  path="/login/sso-callback"
                  element={<AuthenticateWithRedirectCallback />}
                />

                {/* Protected Routes without MainLayout (Onboarding) */}
                <Route element={<ProtectedRoute />}>
                  <Route path="dashboard" element={<RoleBasedDashboard />} />
                  <Route path="pending" element={<PendingUserDashboard />} />
                  <Route path="start-trial" element={<StartTrialPage />} />
                </Route>

                {/* Protected Routes - All wrapped in ProtectedRoute and MainLayout */}
                <Route
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Subscription */}
                  <Route path="subscription" element={<SubscriptionPage />} />

                  {/* Notifications */}
                  <Route path="notifications" element={<NotificationsPage />} />

                  {/* Staff Management */}
                  <Route path="staff" element={<StaffManagementPage />} />

                  {/* Clinics */}
                  <Route path="clinics" element={<ClinicsPage />} />
                  <Route path="clinics/new" element={<NewClinicPage />} />
                  <Route path="clinics/:id" element={<ClinicDetailPage />} />
                  <Route
                    path="clinics/settings"
                    element={<ClinicSettingsPage />}
                  />

                  {/* Patients */}
                  <Route path="patients" element={<PatientsPage />} />
                  <Route path="patients/:id" element={<PatientDetailPage />} />
                  <Route
                    path="patients/:id/edit"
                    element={<EditPatientPage />}
                  />

                  {/* Appointments */}
                  <Route path="appointments" element={<AppointmentsPage />} />
                  <Route
                    path="appointments/new"
                    element={<NewAppointmentPage />}
                  />
                  <Route
                    path="appointments/:appointmentId"
                    element={<AppointmentDetailPage />}
                  />

                  {/* Prescriptions */}
                  <Route path="prescriptions" element={<PrescriptionsPage />} />
                  <Route
                    path="prescriptions/new"
                    element={<NewPrescriptionPage />}
                  />
                  <Route
                    path="prescriptions/:id"
                    element={<PrescriptionDetailPage />}
                  />

                  {/* Medications */}
                  <Route path="meds" element={<MedicationsPage />} />
                </Route>
              </Routes>
            </BrowserRouter>

            {/* Toast Notifications */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </ClinicProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </ErrorBoundary>
  </StrictMode>
);

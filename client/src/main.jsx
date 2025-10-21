/**
 * Main Application Entry Point
 * Sets up providers, routing, and global configuration
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from './ErrorBoundary';

import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleBasedDashboard } from './components/RoleBasedDashboard';
import { ClinicProvider } from './hooks/useClinicContext';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Pages
import LandingPage from './pages/LandingPage';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import PatientsPage from './pages/PatientsPage';
// import NewPatientPage from './pages/NewPatientPage'; // Removed: Patients are created through appointments only
import EditPatientPage from './pages/EditPatientPage';
import PatientDetailPage from './pages/PatientDetailPage';
import AppointmentsPage from './pages/AppointmentsPage';
import NewAppointmentPage from './pages/NewAppointmentPage';
import AppointmentDetailPage from './pages/AppointmentDetailPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import NewPrescriptionPage from './pages/NewPrescriptionPage';
import PrescriptionDetailPage from './pages/PrescriptionDetailPage';
import MedicationsPage from './pages/MedicationsPage';
import ClinicsPage from './pages/ClinicsPage';
import NewClinicPage from './pages/NewClinicPage';
import ClinicDetailPage from './pages/ClinicDetailPage';

// Get Clerk publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key');
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <QueryClientProvider client={queryClient}>
          <ClinicProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Protected Routes - All wrapped in ProtectedRoute and MainLayout */}
                <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                  <Route path="dashboard" element={<RoleBasedDashboard />} />
                  
                  {/* Clinics */}
                  <Route path="clinics" element={<ClinicsPage />} />
                  <Route path="clinics/new" element={<NewClinicPage />} />
                  <Route path="clinics/:id" element={<ClinicDetailPage />} />
                  
                  {/* Patients */}
                  <Route path="patients" element={<PatientsPage />} />
                  {/* <Route path="patients/new" element={<NewPatientPage />} /> */} {/* Removed: Patients are created through appointments only */}
                  <Route path="patients/:id" element={<PatientDetailPage />} />
                  <Route path="patients/:id/edit" element={<EditPatientPage />} />
                  
                  {/* Appointments */}
                  <Route path="appointments" element={<AppointmentsPage />} />
                  <Route path="appointments/new" element={<NewAppointmentPage />} />
                  <Route path="appointments/:appointmentId" element={<AppointmentDetailPage />} />
                  
                  {/* Prescriptions */}
                  <Route path="prescriptions" element={<PrescriptionsPage />} />
                  <Route path="prescriptions/new" element={<NewPrescriptionPage />} />
                  <Route path="prescriptions/:id" element={<PrescriptionDetailPage />} />
                  
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

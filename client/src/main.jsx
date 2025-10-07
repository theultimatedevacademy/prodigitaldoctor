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

import { ProtectedRoute } from './components/ProtectedRoute';
import { ClinicProvider } from './hooks/useClinicContext';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Pages
import LandingPage from './pages/LandingPage';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import PatientsPage from './pages/PatientsPage';
import NewPatientPage from './pages/NewPatientPage';
import PatientDetailPage from './pages/PatientDetailPage';
import NewPrescriptionPage from './pages/NewPrescriptionPage';
import PrescriptionDetailPage from './pages/PrescriptionDetailPage';
import MedicationsPage from './pages/MedicationsPage';

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
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <ClinicProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Protected Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DoctorDashboard />} />
                
                {/* Patients */}
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/patients/new" element={<NewPatientPage />} />
                <Route path="/patients/:id" element={<PatientDetailPage />} />
                
                {/* Prescriptions */}
                <Route path="/prescriptions/new" element={<NewPrescriptionPage />} />
                <Route path="/prescriptions/:id" element={<PrescriptionDetailPage />} />
                
                {/* Medications */}
                <Route path="/meds" element={<MedicationsPage />} />
                
                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
  </StrictMode>
);

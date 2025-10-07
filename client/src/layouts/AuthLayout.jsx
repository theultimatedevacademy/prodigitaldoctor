/**
 * AuthLayout Component
 * Layout for authentication pages (sign-in, sign-up)
 */

import { Outlet } from 'react-router';
import { FileText } from 'lucide-react';

/**
 * AuthLayout component
 * Provides layout for auth pages with branding
 */
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-clinical-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-clinical-900 mb-2">
            ProDigital Doctor
          </h1>
          <p className="text-clinical-600">
            Electronic Medical Records & Prescription Management
          </p>
        </div>
        
        {/* Auth content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <Outlet />
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6 text-sm text-clinical-600">
          <p>Secure, HIPAA-compliant healthcare platform</p>
        </div>
      </div>
    </div>
  );
}

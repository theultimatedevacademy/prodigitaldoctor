/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 */

import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router';
import { LoadingOverlay } from './ui/Spinner';

/**
 * ProtectedRoute component
 * Redirects to sign-in if not authenticated
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.requiredRole - Required user role
 */
export function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return <LoadingOverlay message="Loading..." />;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }
  
  // TODO: Add role checking when backend user is loaded
  // For now, just check if signed in
  
  return children;
}

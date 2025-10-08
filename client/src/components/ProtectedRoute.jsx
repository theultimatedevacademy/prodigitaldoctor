/**
 * ProtectedRoute Component
 * Wraps routes that require authentication and optional role checking
 */

import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router';
import { LoadingOverlay } from './ui/Spinner';
import { useAuth as useAppAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute component
 * Redirects to sign-in if not authenticated or insufficient permissions
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string|string[]} props.requiredRole - Required user role(s)
 */
export function ProtectedRoute({ children, requiredRole }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user, isLoading: isUserLoading, hasRole } = useAppAuth();
  
  if (!isLoaded || isUserLoading) {
    return <LoadingOverlay message="Loading..." />;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }
  
  // Check role if required
  if (requiredRole && user) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = roles.some(role => hasRole(role));
    
    if (!hasRequiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return children;
}

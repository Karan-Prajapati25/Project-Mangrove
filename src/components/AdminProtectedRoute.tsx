import React from 'react';
import { useAdminAccess } from '../hooks/useAdmin';
import { Navigate } from 'react-router-dom';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Array<'read_reports' | 'manage_users' | 'view_analytics' | 'manage_admins' | 'manage_content' | 'moderate_reports'>;
  requireAllPermissions?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
  requiredPermissions,
  requireAllPermissions = true,
  fallback,
  redirectTo = '/dashboard'
}) => {
  const { canAccess, canAccessAny, isAdmin, loading } = useAdminAccess(requiredPermissions);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check access based on requirements
  const hasAccess = requiredPermissions 
    ? (requireAllPermissions ? canAccess : canAccessAny)
    : isAdmin;

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

// Convenience components for different admin levels
export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdminProtectedRoute 
    requiredPermissions={['manage_admins']} 
    requireAllPermissions={true}
    redirectTo="/admin"
  >
    {children}
  </AdminProtectedRoute>
);

export const ModeratorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdminProtectedRoute 
    requiredPermissions={['moderate_reports']} 
    requireAllPermissions={false}
    redirectTo="/admin"
  >
    {children}
  </AdminProtectedRoute>
);

export const ReportsAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AdminProtectedRoute 
    requiredPermissions={['read_reports']} 
    requireAllPermissions={false}
    redirectTo="/admin"
  >
    {children}
  </AdminProtectedRoute>
);

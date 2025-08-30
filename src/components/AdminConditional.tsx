import React from 'react';
import { useAdminAccess } from '../hooks/useAdmin';

interface AdminConditionalProps {
  children: React.ReactNode;
  requiredPermissions?: Array<'read_reports' | 'manage_users' | 'view_analytics' | 'manage_admins' | 'manage_content' | 'moderate_reports'>;
  requireAllPermissions?: boolean;
  fallback?: React.ReactNode;
  showLoading?: boolean;
}

export const AdminConditional: React.FC<AdminConditionalProps> = ({
  children,
  requiredPermissions,
  requireAllPermissions = true,
  fallback = null,
  showLoading = false
}) => {
  const { canAccess, canAccessAny, isAdmin, loading } = useAdminAccess(requiredPermissions);

  if (loading && showLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check access based on requirements
  const hasAccess = requiredPermissions 
    ? (requireAllPermissions ? canAccess : canAccessAny)
    : isAdmin;

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Convenience components for different permission levels
export const SuperAdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <AdminConditional 
    requiredPermissions={['manage_admins']} 
    requireAllPermissions={true}
    fallback={fallback}
  >
    {children}
  </AdminConditional>
);

export const ModeratorOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <AdminConditional 
    requiredPermissions={['moderate_reports']} 
    requireAllPermissions={false}
    fallback={fallback}
  >
    {children}
  </AdminConditional>
);

export const ReportsAdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <AdminConditional 
    requiredPermissions={['read_reports']} 
    requireAllPermissions={false}
    fallback={fallback}
  >
    {children}
  </AdminConditional>
);

export const UsersAdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <AdminConditional 
    requiredPermissions={['manage_users']} 
    requireAllPermissions={false}
    fallback={fallback}
  >
    {children}
  </AdminConditional>
);

export const AnalyticsAdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <AdminConditional 
    requiredPermissions={['view_analytics']} 
    requireAllPermissions={false}
    fallback={fallback}
  >
    {children}
  </AdminConditional>
);

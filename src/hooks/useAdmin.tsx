import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../integrations/supabase/client';

export interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'super_admin' | 'moderator';
  permissions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  notes?: string;
}

export interface AdminPermissions {
  read_reports: boolean;
  manage_users: boolean;
  view_analytics: boolean;
  manage_admins: boolean;
  manage_content: boolean;
  moderate_reports: boolean;
}

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is any type of admin
  const isAdmin = !!adminUser && adminUser.is_active;
  
  // Check if user is super admin
  const isSuperAdmin = isAdmin && adminUser?.role === 'super_admin';
  
  // Check if user is moderator
  const isModerator = isAdmin && adminUser?.role === 'moderator';
  
  // Check if user is regular admin
  const isRegularAdmin = isAdmin && adminUser?.role === 'admin';

  // Get permissions object
  const permissions: AdminPermissions = {
    read_reports: isAdmin && adminUser?.permissions.includes('read_reports') || false,
    manage_users: isAdmin && adminUser?.permissions.includes('manage_users') || false,
    view_analytics: isAdmin && adminUser?.permissions.includes('view_analytics') || false,
    manage_admins: isSuperAdmin, // Only super admins can manage other admins
    manage_content: isAdmin && adminUser?.permissions.includes('manage_content') || false,
    moderate_reports: isAdmin && adminUser?.permissions.includes('moderate_reports') || false,
  };

  // Check if user has specific permission
  const hasPermission = (permission: keyof AdminPermissions): boolean => {
    return permissions[permission] || false;
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissionList: (keyof AdminPermissions)[]): boolean => {
    return permissionList.some(permission => permissions[permission]);
  };

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissionList: (keyof AdminPermissions)[]): boolean => {
    return permissionList.every(permission => permissions[permission]);
  };

  // Fetch admin data
  const fetchAdminData = async () => {
    if (!user) {
      setAdminUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setAdminUser(data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Refresh admin data
  const refreshAdminData = () => {
    fetchAdminData();
  };

  // Log admin action (for audit trail)
  const logAction = async (
    actionType: string,
    targetType: string,
    targetId?: string,
    details?: Record<string, any>
  ) => {
    if (!isAdmin) {
      console.warn('Attempted to log action as non-admin user');
      return null;
    }

    try {
      const { data, error } = await supabase.rpc('log_admin_action', {
        action_type: actionType,
        target_type: targetType,
        target_id: targetId,
        details: details ? JSON.stringify(details) : null
      });

      if (error) {
        console.error('Failed to log admin action:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error logging admin action:', err);
      return null;
    }
  };

  // Effect to fetch admin data when user changes
  useEffect(() => {
    if (!authLoading) {
      fetchAdminData();
    }
  }, [user, authLoading]);

  return {
    // State
    adminUser,
    loading: loading || authLoading,
    error,
    
    // Role checks
    isAdmin,
    isSuperAdmin,
    isModerator,
    isRegularAdmin,
    
    // Permissions
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Actions
    refreshAdminData,
    logAction,
  };
};

// Hook for checking if current user can access admin features
export const useAdminAccess = (requiredPermissions?: (keyof AdminPermissions)[]) => {
  const { isAdmin, hasAllPermissions, hasAnyPermission } = useAdmin();
  
  const canAccess = requiredPermissions 
    ? hasAllPermissions(requiredPermissions)
    : isAdmin;
  
  const canAccessAny = requiredPermissions 
    ? hasAnyPermission(requiredPermissions)
    : isAdmin;

  return {
    canAccess,
    canAccessAny,
    isAdmin,
  };
};

// Hook for admin-only components
export const useAdminOnly = () => {
  const { isAdmin, loading, error } = useAdmin();
  
  if (loading) {
    return { loading: true, error: null, isAdmin: false };
  }
  
  if (!isAdmin) {
    return { loading: false, error: 'Access denied. Admin privileges required.', isAdmin: false };
  }
  
  return { loading: false, error: null, isAdmin: true };
};

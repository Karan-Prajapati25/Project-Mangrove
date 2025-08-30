import React from 'react';
import { useAdmin, useAdminAccess, useAdminOnly } from '../hooks/useAdmin';
import { AdminProtectedRoute, SuperAdminRoute, ModeratorRoute } from '../components/AdminProtectedRoute';
import { AdminConditional, SuperAdminOnly, ModeratorOnly } from '../components/AdminConditional';

// Example 1: Basic admin hook usage
export const AdminDashboard: React.FC = () => {
  const { 
    isAdmin, 
    isSuperAdmin, 
    isModerator, 
    permissions, 
    hasPermission,
    logAction 
  } = useAdmin();

  const handleUserAction = async () => {
    // Log the action for audit trail
    await logAction('user_management', 'user', 'user-123', { action: 'role_change' });
  };

  if (!isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold">Role</h3>
          <p>{isSuperAdmin ? 'Super Admin' : isModerator ? 'Moderator' : 'Admin'}</p>
        </div>
        
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold">Permissions</h3>
          <ul className="text-sm">
            {Object.entries(permissions).map(([key, value]) => (
              <li key={key} className={value ? 'text-green-600' : 'text-gray-400'}>
                {key}: {value ? '✓' : '✗'}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold">Quick Actions</h3>
          <button 
            onClick={handleUserAction}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            Manage Users
          </button>
        </div>
      </div>

      {/* Conditional rendering based on permissions */}
      <AdminConditional requiredPermissions={['manage_users']}>
        <div className="bg-yellow-100 p-4 rounded-lg mb-4">
          <h3 className="font-semibold">User Management</h3>
          <p>You have access to user management features.</p>
        </div>
      </AdminConditional>

      <SuperAdminOnly>
        <div className="bg-red-100 p-4 rounded-lg mb-4">
          <h3 className="font-semibold">Super Admin Panel</h3>
          <p>Only super admins can see this section.</p>
        </div>
      </SuperAdminOnly>
    </div>
  );
};

// Example 2: Using AdminProtectedRoute for route protection
export const AdminRoutes: React.FC = () => {
  return (
    <div>
      {/* Basic admin route - any admin can access */}
      <AdminProtectedRoute>
        <AdminDashboard />
      </AdminProtectedRoute>

      {/* Super admin only route */}
      <SuperAdminRoute>
        <div className="p-6">
          <h2 className="text-xl font-bold">Super Admin Panel</h2>
          <p>Manage other admins and system settings.</p>
        </div>
      </SuperAdminRoute>

      {/* Moderator route */}
      <ModeratorRoute>
        <div className="p-6">
          <h2 className="text-xl font-bold">Moderator Panel</h2>
          <p>Moderate reports and content.</p>
        </div>
      </ModeratorRoute>

      {/* Custom permission route */}
      <AdminProtectedRoute 
        requiredPermissions={['read_reports', 'view_analytics']}
        requireAllPermissions={false}
        fallback={<div>You need either reports or analytics access.</div>}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold">Reports & Analytics</h2>
          <p>View reports and analytics data.</p>
        </div>
      </AdminProtectedRoute>
    </div>
  );
};

// Example 3: Using useAdminAccess for conditional logic
export const AdminNavigation: React.FC = () => {
  const { canAccess, canAccessAny } = useAdminAccess(['manage_users', 'view_analytics']);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="flex space-x-4">
        <a href="/dashboard" className="hover:text-gray-300">Dashboard</a>
        
        {/* Show if user has ANY of the permissions */}
        {canAccessAny && (
          <a href="/admin" className="hover:text-gray-300">Admin Panel</a>
        )}
        
        {/* Show if user has ALL of the permissions */}
        {canAccess && (
          <a href="/admin/advanced" className="hover:text-gray-300">Advanced Admin</a>
        )}
        
        {/* Always show for admins */}
        <AdminConditional>
          <a href="/admin/reports" className="hover:text-gray-300">Reports</a>
        </AdminConditional>
      </div>
    </nav>
  );
};

// Example 4: Using useAdminOnly for simple admin checks
export const AdminOnlyComponent: React.FC = () => {
  const { loading, error, isAdmin } = useAdminOnly();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!isAdmin) {
    return <div>Access denied</div>;
  }

  return (
    <div className="p-4 bg-green-100 rounded-lg">
      <h3 className="font-semibold">Admin Content</h3>
      <p>This content is only visible to admins.</p>
    </div>
  );
};

// Example 5: Conditional UI elements
export const ConditionalUI: React.FC = () => {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Conditional UI Examples</h2>
      
      {/* Show different content based on admin level */}
      <SuperAdminOnly>
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="font-semibold">Super Admin Features</h3>
          <button className="bg-red-500 text-white px-4 py-2 rounded">
            Manage Admins
          </button>
        </div>
      </SuperAdminOnly>

      <ModeratorOnly>
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold">Moderator Features</h3>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Moderate Content
          </button>
        </div>
      </ModeratorOnly>

      {/* Show fallback for non-admins */}
      <AdminConditional fallback={<div className="text-gray-500">Sign in as admin to see more features</div>}>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold">Admin Features</h3>
          <p>You have access to admin features!</p>
        </div>
      </AdminConditional>
    </div>
  );
};

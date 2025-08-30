import express from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

// ===== USER MANAGEMENT =====

// Get all users with profiles
router.get('/users', async (req, res) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;
    
    let query = supabase
      .from('profiles')
      .select(`
        *,
        coins:user_id (balance),
        reports:user_id (count)
      `)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`display_name.ilike.%${search}%,country.ilike.%${search}%`);
    }
    
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: users, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ users });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user details by ID
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: user, error } = await supabase
      .from('profiles')
      .select(`
        *,
        coins:user_id (balance),
        reports:user_id (*)
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile (admin)
router.put('/users/:userId', [
  body('display_name').optional().trim().notEmpty(),
  body('country').optional().trim().notEmpty(),
  body('points').optional().isInt({ min: 0 }),
  body('rank').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const updateData = req.body;
    updateData.updated_at = new Date().toISOString();

    const { data: user, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ user });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ban/unban user
router.post('/users/:userId/ban', [
  body('banned').isBoolean(),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { banned, reason } = req.body;

    // Update user's banned status in auth.users (this would require a custom function)
    // For now, we'll store it in profiles
    const { data: user, error } = await supabase
      .from('profiles')
      .update({
        banned,
        ban_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      user,
      message: banned ? 'User banned successfully' : 'User unbanned successfully'
    });
  } catch (error) {
    console.error('User ban error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user (admin only)
router.post('/users', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('display_name').trim().notEmpty(),
  body('country').trim().notEmpty(),
  body('is_admin').optional().isBoolean(),
  body('role_type').optional().isIn(['User', 'Moderator', 'Admin', 'Super Admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, display_name, country, is_admin, role_type } = req.body;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/confirm`,
        data: {
          display_name,
          country
        }
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    if (authData.user) {
      // Create profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: authData.user.id,
            display_name,
            country,
            points: is_admin ? 500 : 100,
            rank: null,
            is_admin: is_admin || false
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      // Create coins record
      const { error: coinsError } = await supabase
        .from('coins')
        .insert([
          {
            user_id: authData.user.id,
            balance: is_admin ? 500 : 100
          }
        ]);

      if (coinsError) {
        console.error('Coins creation error:', coinsError);
      }

      // If admin user, create admin role
      if (is_admin && role_type) {
        const { error: adminRoleError } = await supabase
          .from('admin_roles')
          .insert([
            {
              user_id: authData.user.id,
              role_type: role_type || 'Admin',
              verification_status: 'Approved',
              approved_at: new Date().toISOString(),
              approved_by: req.user.id,
              admin_notes: 'Created by admin',
              permissions: role_type === 'Super Admin' 
                ? ['user_management', 'admin_management', 'report_management', 'system_admin']
                : ['user_management', 'report_management']
            }
          ]);

        if (adminRoleError) {
          console.error('Admin role creation error:', adminRoleError);
        }
      }

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          display_name,
          country,
          is_admin: is_admin || false,
          role_type: is_admin ? (role_type || 'Admin') : null
        }
      });
    }
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== REPORT MANAGEMENT =====

// Get all reports with filtering and pagination
router.get('/reports', async (req, res) => {
  try {
    const { 
      status, 
      incident_type, 
      severity, 
      user_id,
      limit = 50, 
      offset = 0 
    } = req.query;
    
    let query = supabase
      .from('reports')
      .select(`
        *,
        profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) query = query.eq('status', status);
    if (incident_type) query = query.eq('incident_type', incident_type);
    if (severity) query = query.eq('severity', severity);
    if (user_id) query = query.eq('user_id', user_id);
    
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: reports, error, count } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      reports,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: count || reports.length
      }
    });
  } catch (error) {
    console.error('Reports fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update report status (admin)
router.put('/reports/:id/status', [
  body('status').isIn(['Pending', 'Investigating', 'Resolved', 'Dismissed']),
  body('admin_notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const { data: report, error } = await supabase
      .from('reports')
      .update({
        status,
        admin_notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ report });
  } catch (error) {
    console.error('Report status update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== ADMIN ROLE MANAGEMENT =====

// Get all admin applications
router.get('/admin-applications', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('admin_roles')
      .select(`
        *,
        profiles:user_id (
          display_name,
          email:user_id
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('verification_status', status);
    }
    
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: applications, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ applications });
  } catch (error) {
    console.error('Admin applications fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve/reject admin application
router.put('/admin-applications/:id/status', [
  body('verification_status').isIn(['Approved', 'Rejected']),
  body('admin_notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { verification_status, admin_notes } = req.body;

    const { data: application, error } = await supabase
      .from('admin_roles')
      .update({
        verification_status,
        approved_at: verification_status === 'Approved' ? new Date().toISOString() : null,
        approved_by: req.user.id,
        admin_notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      application,
      message: `Admin application ${verification_status.toLowerCase()} successfully`
    });
  } catch (error) {
    console.error('Admin application status update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new admin role
router.post('/admin-roles', [
  body('user_id').isUUID(),
  body('role_type').isIn(['Moderator', 'Admin', 'Super Admin']),
  body('permissions').optional().isArray(),
  body('admin_notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, role_type, permissions, admin_notes } = req.body;

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .eq('user_id', user_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if admin role already exists
    const { data: existingRole } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (existingRole) {
      return res.status(400).json({ error: 'User already has an admin role' });
    }

    // Set default permissions based on role type
    let defaultPermissions = [];
    if (role_type === 'Super Admin') {
      defaultPermissions = ['user_management', 'admin_management', 'report_management', 'system_admin'];
    } else if (role_type === 'Admin') {
      defaultPermissions = ['user_management', 'report_management'];
    } else {
      defaultPermissions = ['report_management'];
    }

    // Create admin role
    const { data: adminRole, error: roleError } = await supabase
      .from('admin_roles')
      .insert([
        {
          user_id,
          role_type,
          verification_status: 'Approved',
          approved_at: new Date().toISOString(),
          approved_by: req.user.id,
          admin_notes: admin_notes || 'Created by admin',
          permissions: permissions || defaultPermissions
        }
      ])
      .select()
      .single();

    if (roleError) {
      return res.status(400).json({ error: roleError.message });
    }

    // Update user profile to mark as admin
    await supabase
      .from('profiles')
      .update({ 
        is_admin: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id);

    res.status(201).json({
      message: 'Admin role created successfully',
      adminRole,
      user: {
        id: user.user_id,
        display_name: user.display_name,
        role_type
      }
    });
  } catch (error) {
    console.error('Admin role creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update admin role
router.put('/admin-roles/:id', [
  body('role_type').optional().isIn(['Moderator', 'Admin', 'Super Admin']),
  body('permissions').optional().isArray(),
  body('admin_notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;
    updateData.updated_at = new Date().toISOString();

    const { data: adminRole, error } = await supabase
      .from('admin_roles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'Admin role updated successfully',
      adminRole
    });
  } catch (error) {
    console.error('Admin role update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove admin role
router.delete('/admin-roles/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get admin role details
    const { data: adminRole, error: fetchError } = await supabase
      .from('admin_roles')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Admin role not found' });
    }

    // Delete admin role
    const { error: deleteError } = await supabase
      .from('admin_roles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(400).json({ error: deleteError.message });
    }

    // Update user profile to remove admin status
    await supabase
      .from('profiles')
      .update({ 
        is_admin: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', adminRole.user_id);

    res.json({
      message: 'Admin role removed successfully'
    });
  } catch (error) {
    console.error('Admin role removal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== SYSTEM STATISTICS =====

// Get system overview statistics
router.get('/stats/overview', async (req, res) => {
  try {
    // Get total counts
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    const { count: totalReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact' });

    const { count: totalCourses } = await supabase
      .from('courses')
      .select('*', { count: 'exact' });

    const { count: totalQuizzes } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact' });

    // Get reports by status
    const { data: reportsByStatus } = await supabase
      .from('reports')
      .select('status');

    // Get reports by severity
    const { data: reportsBySeverity } = await supabase
      .from('reports')
      .select('severity');

    // Get reports by type
    const { data: reportsByType } = await supabase
      .from('reports')
      .select('incident_type');

    // Get user activity (reports in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentReports } = await supabase
      .from('reports')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Calculate statistics
    const stats = {
      totals: {
        users: totalUsers || 0,
        reports: totalReports || 0,
        courses: totalCourses || 0,
        quizzes: totalQuizzes || 0
      },
      reports: {
        byStatus: reportsByStatus?.reduce((acc, report) => {
          acc[report.status] = (acc[report.status] || 0) + 1;
          return acc;
        }, {}) || {},
        bySeverity: reportsBySeverity?.reduce((acc, report) => {
          acc[report.severity] = (acc[report.severity] || 0) + 1;
          return acc;
        }, {}) || {},
        byType: reportsByType?.reduce((acc, report) => {
          acc[report.incident_type] = (acc[report.incident_type] || 0) + 1;
          return acc;
        }, {}) || {},
        recent: recentReports?.length || 0
      }
    };

    res.json({ stats });
  } catch (error) {
    console.error('Statistics fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user activity timeline
router.get('/stats/user-activity', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get reports created in the time period
    const { data: reports } = await supabase
      .from('reports')
      .select('created_at, user_id')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Get user registrations in the time period
    const { data: registrations } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Group by date
    const activityByDate = {};
    const currentDate = new Date(startDate);

    while (currentDate <= new Date()) {
      const dateKey = currentDate.toISOString().split('T')[0];
      activityByDate[dateKey] = {
        reports: 0,
        registrations: 0
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Count reports by date
    reports?.forEach(report => {
      const dateKey = report.created_at.split('T')[0];
      if (activityByDate[dateKey]) {
        activityByDate[dateKey].reports++;
      }
    });

    // Count registrations by date
    registrations?.forEach(registration => {
      const dateKey = registration.created_at.split('T')[0];
      if (activityByDate[dateKey]) {
        activityByDate[dateKey].registrations++;
      }
    });

    res.json({ 
      activityByDate,
      period: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
        days: parseInt(days)
      }
    });
  } catch (error) {
    console.error('User activity fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

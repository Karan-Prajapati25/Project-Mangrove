# 🗄️ Database Setup Summary

## 📋 Overview
This document summarizes all database changes and provides setup instructions for the admin system.

## 🚨 Issues Fixed
1. **Conflicting Migrations**: Removed duplicate and conflicting migration files
2. **Old Table References**: Eliminated references to deprecated `admin_roles` table
3. **Password Consistency**: Ensured password `urvish123` is used consistently
4. **Table Structure**: Consolidated admin system into clean, single migration

## 📁 Migration Files

### ✅ Active Migrations
- `20250830044035_1c9d81f3-5dcf-448e-9ab3-c96d189c2c06.sql` - Core tables (profiles, reports, courses, etc.)
- `20250830095200_consolidated_admin_setup.sql` - **NEW: Consolidated admin system**

### ❌ Removed Migrations
- `20250830094800_7bbaa765-93c9-4f9f-b21e-bcea087e87db.sql` - Conflicting admin setup
- `20250830055913_3b5688bc-2b40-4ac8-8b6d-36eb2d552dce.sql` - Old admin_roles table
- `20250830095100_create_admin_table.sql` - Duplicate admin setup

## 🏗️ Database Schema

### Core Tables
1. **`profiles`** - User profiles and information
2. **`reports`** - Environmental incident reports
3. **`courses`** - Educational content
4. **`quizzes`** - Assessment tools
5. **`guides`** - Educational guides
6. **`coins`** - User reward system
7. **`rewards`** - Reward catalog
8. **`user_rewards`** - User reward purchases

### Admin System Tables
1. **`admins`** - Admin user management
   - `id`: Unique identifier
   - `user_id`: Links to auth.users
   - `role`: admin, super_admin, or moderator
   - `permissions`: Array of permissions
   - `is_active`: Boolean status
   - `created_at/updated_at`: Timestamps
   - `created_by`: Who created this admin
   - `notes`: Additional notes

2. **`admin_actions`** - Audit trail for admin activities
   - `id`: Unique identifier
   - `admin_id`: Links to admins table
   - `action_type`: Type of action performed
   - `target_type`: What was affected
   - `target_id`: ID of affected item
   - `details`: JSON details of action
   - `ip_address`: IP address of admin
   - `user_agent`: Browser/client info
   - `created_at`: When action occurred

## 🔐 Admin Roles & Permissions

### Role Hierarchy
1. **`super_admin`** - Full system access
2. **`admin`** - Standard admin access
3. **`moderator`** - Limited admin access

### Available Permissions
- `read_reports` - View all reports
- `manage_users` - Manage user accounts
- `view_analytics` - Access analytics
- `manage_admins` - Manage other admins (super admin only)
- `manage_content` - Manage educational content
- `moderate_reports` - Moderate user reports

## 🚀 Setup Instructions

### 1. Apply Database Migrations
```bash
# In your Supabase project
supabase db push

# Or manually run the consolidated migration
# supabase/migrations/20250830095200_consolidated_admin_setup.sql
```

### 2. Create Super Admin User
```bash
cd server
node setup-admin.js
```

This will create:
- User: `baraiyaurvish611@gmail.com`
- Password: `urvish123`
- Role: `super_admin`
- Full permissions

### 3. Verify Setup
```sql
-- Check if admin tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('admins', 'admin_actions');

-- Check if super admin was created
SELECT * FROM public.admins WHERE role = 'super_admin';
```

## 🔧 Helper Functions

### Database Functions
- `is_admin(user_uuid)` - Check if user is admin
- `is_super_admin(user_uuid)` - Check if user is super admin
- `log_admin_action(action_type, target_type, target_id, details)` - Log admin activities

### Frontend Hooks
- `useAdmin()` - Main admin hook
- `useAdminAccess()` - Permission checking
- `useAdminOnly()` - Simple admin validation

## 🛡️ Security Features

### Row Level Security (RLS)
- All admin tables have RLS enabled
- Only admins can view admin data
- Only super admins can manage other admins
- All admin actions are logged for audit

### Policies
- **Admins Table**: Only admins can view, only super admins can modify
- **Admin Actions**: Only admins can view and insert
- **Profiles**: Users can only modify their own profiles
- **Reports**: Users can view all, modify only their own

## 📊 Sample Data

### Educational Content
- Marine Ecosystem Basics (Beginner)
- Mangrove Conservation (Intermediate)
- Climate Change Impact (Advanced)

### Rewards
- Eco-Friendly Water Bottle (100 coins)
- Tree Planting Certificate (150 coins)
- Mangrove Guardian T-Shirt (200 coins)
- Digital Conservation Course (300 coins)

## 🔍 Troubleshooting

### Common Issues
1. **Migration Conflicts**: Ensure only the consolidated migration is applied
2. **Permission Denied**: Check if user has proper admin role
3. **Table Not Found**: Verify migrations were applied successfully

### Verification Commands
```sql
-- Check admin system status
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name LIKE '%admin%';

-- Verify super admin exists
SELECT 
    a.role,
    a.permissions,
    p.display_name,
    p.email
FROM public.admins a
JOIN public.profiles p ON a.user_id = p.user_id
WHERE a.role = 'super_admin';
```

## 📝 Notes
- All timestamps use `TIMESTAMP WITH TIME ZONE`
- UUIDs are used for all primary keys
- Foreign keys have proper CASCADE delete rules
- Indexes are created for performance on frequently queried columns
- Audit trail captures all admin actions for compliance

## 🎯 Next Steps
1. Apply the consolidated migration
2. Run the setup script to create super admin
3. Test admin functionality in your frontend
4. Create additional admin users as needed
5. Customize permissions based on your requirements

# 🔧 Admin User Setup Guide

## 🎯 Overview
This guide will help you set up the admin user with the credentials:
- **Email**: `baraiyaurvish611@gmail.com`
- **Password**: `urvish123`

## 📋 Prerequisites
1. Backend server is running
2. Supabase connection is working
3. Environment variables are configured

## 🚀 Step-by-Step Setup

### Step 1: Run the Admin Setup Script

Navigate to the server directory and run the admin setup script:

```bash
cd server
npm run setup-admin
```

This script will:
- ✅ Create the user account in Supabase Auth
- ✅ Create a user profile with admin privileges
- ✅ Set up coins and points
- ✅ Create admin role with "Super Admin" permissions
- ✅ Verify the setup

### Step 2: Verify Setup Success

You should see output like:
```
🔧 Setting up admin user...

1. Creating user in Supabase Auth...
✅ User created successfully: [user-id]

2. Creating user profile...
✅ Profile created successfully

3. Creating coins record...
✅ Coins record created successfully

4. Creating admin role...
✅ Admin role created successfully

5. Verifying admin setup...
✅ Admin setup verified successfully!

📋 Admin User Details:
   ID: [user-id]
   Email: baraiyaurvish611@gmail.com
   Display Name: Urvish Baraiya
   Role: Super Admin
   Status: Approved
   Permissions: user_management, admin_management, report_management, system_admin

🎉 Admin user setup completed!

📧 Login credentials:
   Email: baraiyaurvish611@gmail.com
   Password: urvish123

⚠️  Please change the password after first login!
```

### Step 3: Start Both Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Step 4: Login to Admin Dashboard

1. Open your browser and go to `http://localhost:3000`
2. Navigate to the login page
3. Use the admin credentials:
   - **Email**: `baraiyaurvish611@gmail.com`
   - **Password**: `urvish123`
4. You should be redirected to the admin dashboard

## 🎛️ Admin Dashboard Features

### User Management
- ✅ View all users in the system
- ✅ Search and filter users
- ✅ Create new users (regular or admin)
- ✅ Ban/unban users
- ✅ View user statistics

### Admin Management
- ✅ View all admin users
- ✅ Promote regular users to admin
- ✅ Manage admin roles and permissions
- ✅ Remove admin privileges

### System Statistics
- ✅ Total users count
- ✅ Total reports count
- ✅ Total courses and quizzes
- ✅ System overview

## 🔐 Admin Permissions

As a **Super Admin**, you have access to:
- **User Management**: Create, view, edit, ban users
- **Admin Management**: Promote users to admin, manage roles
- **Report Management**: View and manage incident reports
- **System Admin**: Full system access and configuration

## 🚨 Security Notes

1. **Change Password**: Change the default password after first login
2. **Admin Access**: Only share admin credentials with trusted team members
3. **Session Management**: Log out when not using the admin panel
4. **Audit Trail**: All admin actions are logged for security

## 🆘 Troubleshooting

### Common Issues

1. **"User already exists" error**
   - The user account already exists in Supabase
   - Check if you can login directly

2. **"Missing environment variables" error**
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `server/.env`
   - Verify all required environment variables

3. **"Connection failed" error**
   - Check Supabase connection
   - Verify network connectivity
   - Ensure backend server is running

4. **"Admin role creation failed" error**
   - Check database permissions
   - Verify `admin_roles` table exists
   - Check RLS policies

### Getting Help

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test Supabase connection independently
4. Review the backend logs for specific error details

## 🎉 Next Steps

After successful setup:

1. **Test Admin Functions**:
   - Create a test user
   - Promote a user to admin
   - Test user management features

2. **Customize Settings**:
   - Update admin profile information
   - Configure system preferences
   - Set up additional admin users

3. **Security Hardening**:
   - Change default password
   - Set up 2FA if available
   - Review and update permissions

---

**🎯 Your admin user is now ready! You can manage the entire system from the admin dashboard.**

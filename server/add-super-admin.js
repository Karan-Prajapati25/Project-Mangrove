import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';

dotenv.config();

const ADMIN_EMAIL = 'baraiyaurvish611@gmail.com';

async function addSuperAdmin() {
  console.log('🔧 Adding existing user as super admin...\n');

  try {
    // Step 1: Get user by email
    console.log('1. Finding user by email...');
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Failed to list users:', userError.message);
      return;
    }

    const user = users.find(u => u.email === ADMIN_EMAIL);
    
    if (!user) {
      console.error('❌ User not found with email:', ADMIN_EMAIL);
      console.log('Please create the user first using the setup-admin.js script');
      return;
    }

    console.log('✅ User found:', user.id);

    // Step 2: Check if user is already an admin
    console.log('\n2. Checking existing admin status...');
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingAdmin) {
      console.log('⚠️  User is already an admin with role:', existingAdmin.role);
      
      if (existingAdmin.role === 'super_admin') {
        console.log('✅ User is already a super admin!');
        return;
      }
      
      // Update to super admin
      console.log('🔄 Updating user to super admin...');
      const { error: updateError } = await supabase
        .from('admins')
        .update({
          role: 'super_admin',
          permissions: [
            'read_reports',
            'manage_users', 
            'view_analytics',
            'manage_admins',
            'manage_content',
            'moderate_reports'
          ],
          updated_at: new Date().toISOString(),
          notes: 'Updated to super admin - Urvish Baraiya'
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('❌ Update failed:', updateError.message);
        return;
      }
      
      console.log('✅ User updated to super admin successfully!');
    } else {
      // Create new admin record
      console.log('\n3. Creating super admin record...');
      const { error: adminError } = await supabase
        .from('admins')
        .insert([
          {
            user_id: user.id,
            role: 'super_admin',
            permissions: [
              'read_reports',
              'manage_users', 
              'view_analytics',
              'manage_admins',
              'manage_content',
              'moderate_reports'
            ],
            is_active: true,
            created_by: user.id,
            notes: 'Added as super admin - Urvish Baraiya'
          }
        ]);

      if (adminError) {
        console.error('❌ Admin creation failed:', adminError.message);
        return;
      } else {
        console.log('✅ Super admin record created successfully');
      }
    }

    // Step 3: Verify setup
    console.log('\n4. Verifying admin setup...');
    const { data: adminUser, error: verifyError } = await supabase
      .from('admins')
      .select(`
        *,
        profiles:user_id (
          display_name,
          country,
          points,
          rank
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      console.log('✅ Super admin setup verified successfully!');
      console.log('\n📋 Super Admin User Details:');
      console.log(`   ID: ${adminUser.user_id}`);
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Display Name: ${adminUser.profiles?.display_name || 'N/A'}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Status: ${adminUser.is_active ? 'Active' : 'Inactive'}`);
      console.log(`   Permissions: ${adminUser.permissions.join(', ')}`);
    }

    console.log('\n🎉 Super admin setup completed!');
    console.log(`\n📧 User email: ${ADMIN_EMAIL}`);
    console.log('\n🔑 This user now has SUPER ADMIN privileges and can:');
    console.log('   • Manage other admins');
    console.log('   • Access all admin features');
    console.log('   • View all reports and analytics');
    console.log('   • Manage users and content');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the setup
addSuperAdmin();

import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';

dotenv.config();

const ADMIN_EMAIL = 'baraiyaurvish611@gmail.com';
const ADMIN_PASSWORD = 'urvish123';
const ADMIN_DISPLAY_NAME = 'Urvish Baraiya';
const ADMIN_COUNTRY = 'India';

async function setupAdmin() {
  console.log('🔧 Setting up super admin user...\n');

  try {
    // Step 1: Create user in Supabase Auth using admin API
    console.log('1. Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        display_name: ADMIN_DISPLAY_NAME,
        country: ADMIN_COUNTRY
      }
    });

    if (authError) {
      console.error('❌ Auth creation failed:', authError.message);
      return;
    }

    if (!authData.user) {
      console.error('❌ No user data returned');
      return;
    }

    console.log('✅ User created successfully:', authData.user.id);

    // Step 2: Create profile record
    console.log('\n2. Creating user profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: authData.user.id,
          display_name: ADMIN_DISPLAY_NAME,
          country: ADMIN_COUNTRY,
          points: 1000, // Admin gets bonus points
          rank: 1
        }
      ]);

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message);
    } else {
      console.log('✅ Profile created successfully');
    }

    // Step 3: Create coins record
    console.log('\n3. Creating coins record...');
    const { error: coinsError } = await supabase
      .from('coins')
      .insert([
        {
          user_id: authData.user.id,
          balance: 1000 // Admin gets bonus coins
        }
      ]);

    if (coinsError) {
      console.error('❌ Coins creation failed:', coinsError.message);
    } else {
      console.log('✅ Coins record created successfully');
    }

    // Step 4: Create admin record in new admins table
    console.log('\n4. Creating super admin record...');
    const { error: adminError } = await supabase
      .from('admins')
      .insert([
        {
          user_id: authData.user.id,
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
          created_by: authData.user.id, // Self-created for first admin
          notes: 'Initial super admin setup - Urvish Baraiya'
        }
      ]);

    if (adminError) {
      console.error('❌ Admin creation failed:', adminError.message);
      console.error('Error details:', adminError);
      return;
    } else {
      console.log('✅ Super admin record created successfully');
    }

    // Step 5: Verify setup
    console.log('\n5. Verifying admin setup...');
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
      .eq('user_id', authData.user.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      console.log('✅ Super admin setup verified successfully!');
      console.log('\n📋 Super Admin User Details:');
      console.log(`   ID: ${adminUser.user_id}`);
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Display Name: ${adminUser.profiles.display_name}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Status: ${adminUser.is_active ? 'Active' : 'Inactive'}`);
      console.log(`   Permissions: ${adminUser.permissions.join(', ')}`);
    }

    console.log('\n🎉 Super admin user setup completed!');
    console.log(`\n📧 Login credentials:`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('\n⚠️  Please change the password after first login!');
    console.log('\n🔑 This user has SUPER ADMIN privileges and can:');
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
setupAdmin();

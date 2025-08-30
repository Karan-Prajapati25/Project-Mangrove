import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';

dotenv.config();

const ADMIN_EMAIL = 'baraiyaurvish611@gmail.com';
const ADMIN_PASSWORD = 'urvish123';
const ADMIN_DISPLAY_NAME = 'Urvish Baraiya';
const ADMIN_COUNTRY = 'India';

async function setupAdmin() {
  console.log('🔧 Setting up admin user...\n');

  try {
    // Step 1: Create user in Supabase Auth
    console.log('1. Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/confirm`,
        data: {
          display_name: ADMIN_DISPLAY_NAME,
          country: ADMIN_COUNTRY
        }
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
          rank: 1,
          is_admin: true
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

    // Step 4: Create admin role record
    console.log('\n4. Creating admin role...');
    const { error: adminRoleError } = await supabase
      .from('admin_roles')
      .insert([
        {
          user_id: authData.user.id,
          role_type: 'Super Admin',
          verification_status: 'Approved',
          approved_at: new Date().toISOString(),
          approved_by: authData.user.id, // Self-approved for first admin
          admin_notes: 'Initial super admin setup',
          permissions: ['user_management', 'admin_management', 'report_management', 'system_admin']
        }
      ]);

    if (adminRoleError) {
      console.error('❌ Admin role creation failed:', adminRoleError.message);
    } else {
      console.log('✅ Admin role created successfully');
    }

    // Step 5: Verify setup
    console.log('\n5. Verifying admin setup...');
    const { data: adminUser, error: verifyError } = await supabase
      .from('admin_roles')
      .select(`
        *,
        profiles:user_id (
          display_name,
          email:user_id,
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
      console.log('✅ Admin setup verified successfully!');
      console.log('\n📋 Admin User Details:');
      console.log(`   ID: ${adminUser.user_id}`);
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Display Name: ${adminUser.profiles.display_name}`);
      console.log(`   Role: ${adminUser.role_type}`);
      console(`   Status: ${adminUser.verification_status}`);
      console.log(`   Permissions: ${adminUser.permissions.join(', ')}`);
    }

    console.log('\n🎉 Admin user setup completed!');
    console.log(`\n📧 Login credentials:`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('\n⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
setupAdmin();

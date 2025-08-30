-- Insert super admin user data
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'baraiyaurvish611@gmail.com',
  crypt('Urvish@123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"display_name": "Super Admin"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create a super admin role entry
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the user ID for the super admin
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'baraiyaurvish611@gmail.com';
  
  -- Insert into admin_roles if user exists
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.admin_roles (
      user_id,
      organization_name,
      organization_type,
      verification_status,
      approved_at,
      approved_by
    ) VALUES (
      admin_user_id,
      'MangroveWatch HQ',
      'government',
      'approved',
      now(),
      admin_user_id
    ) ON CONFLICT (user_id) DO UPDATE SET
      verification_status = 'approved',
      approved_at = now();
      
    -- Create profile for super admin
    INSERT INTO public.profiles (
      user_id,
      display_name,
      country,
      points,
      rank
    ) VALUES (
      admin_user_id,
      'Super Admin',
      'Headquarters',
      0,
      1
    ) ON CONFLICT (user_id) DO UPDATE SET
      display_name = 'Super Admin';
  END IF;
END $$;
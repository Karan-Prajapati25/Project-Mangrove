-- Add super admin role capability
ALTER TABLE public.admin_roles ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;

-- Create a function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users u
    JOIN public.admin_roles ar ON u.id = ar.user_id
    WHERE u.email = user_email 
    AND ar.verification_status = 'approved'
    AND ar.is_super_admin = true
  );
$$;

-- Update severity-based coin awarding system
CREATE OR REPLACE FUNCTION public.get_coin_amount_for_severity(severity_level text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN severity_level = 'High' THEN 50
    WHEN severity_level = 'Medium' THEN 30
    WHEN severity_level = 'Low' THEN 15
    ELSE 25
  END;
$$;
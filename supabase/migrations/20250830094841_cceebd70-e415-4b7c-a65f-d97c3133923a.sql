-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.is_super_admin(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
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

-- Fix function search path for coin amount function
CREATE OR REPLACE FUNCTION public.get_coin_amount_for_severity(severity_level text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE 
    WHEN severity_level = 'High' THEN 50
    WHEN severity_level = 'Medium' THEN 30
    WHEN severity_level = 'Low' THEN 15
    ELSE 25
  END;
$$;
-- Check and fix severity constraint
-- First, let's see what the current constraint is
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%severity%';

-- Drop existing constraint if it exists
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_severity_check;

-- Add correct severity constraint that matches the frontend values
ALTER TABLE public.reports ADD CONSTRAINT reports_severity_check 
CHECK (severity IN ('low', 'medium', 'high', 'critical', 'Low', 'Medium', 'High', 'Critical'));
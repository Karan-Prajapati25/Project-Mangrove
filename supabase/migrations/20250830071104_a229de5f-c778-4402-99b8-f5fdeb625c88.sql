-- Check and fix status constraint
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%status%';

-- Drop existing status constraint if it exists
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_status_check;

-- Add correct status constraint that matches the frontend values
ALTER TABLE public.reports ADD CONSTRAINT reports_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'Pending', 'Approved', 'Rejected'));
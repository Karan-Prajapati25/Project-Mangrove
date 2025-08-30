-- Update the severity check constraint to allow 'Pending' value
ALTER TABLE public.reports 
DROP CONSTRAINT IF EXISTS reports_severity_check;

-- Add new check constraint that includes 'Pending'
ALTER TABLE public.reports 
ADD CONSTRAINT reports_severity_check 
CHECK (severity IN ('Low', 'Medium', 'High', 'Critical', 'Pending'));
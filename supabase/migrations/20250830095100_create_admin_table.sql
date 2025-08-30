-- Create admin table
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
    permissions TEXT[] DEFAULT ARRAY['read_reports', 'manage_users', 'view_analytics'],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Create admin_actions table for audit trail
CREATE TABLE public.admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admins(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admins table
CREATE POLICY "Only admins can view admin table" ON public.admins 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Only super admins can insert/update admin table" ON public.admins 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = true
        )
    );

-- Create RLS policies for admin_actions table
CREATE POLICY "Only admins can view admin actions" ON public.admin_actions 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Only admins can insert admin actions" ON public.admin_actions 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = user_uuid AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins 
        WHERE user_id = user_uuid AND role = 'super_admin' AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
    action_type TEXT,
    target_type TEXT,
    target_id UUID DEFAULT NULL,
    details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    admin_uuid UUID;
    action_id UUID;
BEGIN
    -- Get current admin's user ID
    SELECT user_id INTO admin_uuid FROM public.admins WHERE user_id = auth.uid() AND is_active = true;
    
    IF admin_uuid IS NULL THEN
        RAISE EXCEPTION 'User is not an active admin';
    END IF;
    
    -- Insert the action log
    INSERT INTO public.admin_actions (admin_id, action_type, target_type, target_id, details)
    VALUES (admin_uuid, action_type, target_type, target_id, details)
    RETURNING id INTO action_id;
    
    RETURN action_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for updated_at on admins table
CREATE TRIGGER update_admins_updated_at 
    BEFORE UPDATE ON public.admins 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_admins_user_id ON public.admins(user_id);
CREATE INDEX idx_admins_role ON public.admins(role);
CREATE INDEX idx_admins_is_active ON public.admins(is_active);
CREATE INDEX idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX idx_admin_actions_created_at ON public.admin_actions(created_at);
CREATE INDEX idx_admin_actions_action_type ON public.admin_actions(action_type);

-- Grant necessary permissions
GRANT SELECT ON public.admins TO authenticated;
GRANT SELECT ON public.admin_actions TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action(TEXT, TEXT, UUID, JSONB) TO authenticated;

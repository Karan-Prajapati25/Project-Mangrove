-- Create coins table for user coin balances
CREATE TABLE public.coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on coins table
ALTER TABLE public.coins ENABLE ROW LEVEL SECURITY;

-- Create policies for coins table
CREATE POLICY "Users can view their own coins" 
ON public.coins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coins" 
ON public.coins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coins" 
ON public.coins 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create rewards catalog table
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cost_in_coins INTEGER NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT -1, -- -1 means unlimited
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rewards table (public read access)
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rewards" 
ON public.rewards 
FOR SELECT 
USING (is_active = true);

-- Create user reward purchases table
CREATE TABLE public.user_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.rewards(id),
  coins_spent INTEGER NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending' -- pending, delivered, cancelled
);

-- Enable RLS on user_rewards table
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reward purchases" 
ON public.user_rewards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reward purchases" 
ON public.user_rewards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create admin roles table for NGOs/Govt agencies
CREATE TABLE public.admin_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL, -- 'ngo', 'government', 'research'
  verification_status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID
);

-- Enable RLS on admin_roles table
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own admin role" 
ON public.admin_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own admin role application" 
ON public.admin_roles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at on coins table
CREATE TRIGGER update_coins_updated_at
BEFORE UPDATE ON public.coins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Insert some sample rewards
INSERT INTO public.rewards (name, description, cost_in_coins, category, image_url) VALUES
('Eco-Friendly Water Bottle', 'Stainless steel water bottle made from recycled materials', 100, 'lifestyle', NULL),
('Tree Planting Certificate', 'Certificate for planting 5 trees in your name', 150, 'environmental', NULL),
('Mangrove Guardian T-Shirt', 'Official Mangrove Guardian organic cotton t-shirt', 200, 'merchandise', NULL),
('Digital Conservation Course', 'Access to premium conservation education course', 300, 'education', NULL),
('Solar Power Bank', 'Eco-friendly solar-powered device charger', 400, 'lifestyle', NULL),
('Biodiversity Research Access', '1-month access to global biodiversity research database', 500, 'research', NULL);
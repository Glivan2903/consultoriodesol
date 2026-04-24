-- Table to store user roles and permissions
CREATE TABLE IF NOT EXISTS public.inventory_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('superadmin', 'admin', 'user')),
  permissions JSONB DEFAULT '{
    "dashboard": true,
    "products": true,
    "categories": true,
    "incoming": true,
    "outgoing": true,
    "clients": true,
    "companies": true,
    "movements": true,
    "reports": false,
    "settings": false
  }'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.inventory_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.inventory_profiles FOR SELECT 
  USING (auth.uid() = id);

-- 2. Superadmins can view and update everything
CREATE POLICY "Superadmins can manage all profiles" 
  ON public.inventory_profiles FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.inventory_profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.inventory_profiles (id, email, role, permissions)
  VALUES (
    NEW.id, 
    NEW.email, 
    'user', 
    '{
      "dashboard": true,
      "products": true,
      "categories": true,
      "incoming": true,
      "outgoing": true,
      "clients": true,
      "companies": true,
      "movements": true,
      "reports": false,
      "settings": false
    }'::JSONB
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Utility function to promote a user to superadmin (Run this manually in SQL editor for the first user)
-- UPDATE public.inventory_profiles SET role = 'superadmin', permissions = '{"dashboard":true,"products":true,"categories":true,"incoming":true,"outgoing":true,"clients":true,"companies":true,"movements":true,"reports":true,"settings":true}'::jsonb WHERE email = 'your-email@example.com';

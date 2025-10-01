-- Create enum type for user roles
CREATE TYPE user_role_type AS ENUM ('general', 'admin');

-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN role user_role_type NOT NULL DEFAULT 'general';

-- Create index for better performance on role queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- Update RLS policies to allow users to view their own role
-- (existing policies already allow users to view their own profile)

-- Create a helper function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;
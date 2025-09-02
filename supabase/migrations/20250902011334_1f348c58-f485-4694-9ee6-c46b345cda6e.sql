-- Drop all existing policies on household_members
DROP POLICY IF EXISTS "Members can view household members" ON household_members;
DROP POLICY IF EXISTS "Originators can insert household members" ON household_members;
DROP POLICY IF EXISTS "Originators can update household members" ON household_members;
DROP POLICY IF EXISTS "Originators can delete household members" ON household_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON household_members;

-- Create a security definer function to check if user is originator
CREATE OR REPLACE FUNCTION public.is_household_originator(_household_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM households 
    WHERE id = _household_id AND originator_id = _user_id
  )
$$;

-- Create simple, non-recursive policies
CREATE POLICY "Anyone can view household members"
ON household_members FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert members"
ON household_members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update members"
ON household_members FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete members"
ON household_members FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);
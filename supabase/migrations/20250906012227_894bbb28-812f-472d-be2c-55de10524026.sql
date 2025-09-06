-- Fix infinite recursion in household RLS policies with security definer functions

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view household members if they are members" ON household_members;
DROP POLICY IF EXISTS "Household originators can manage members" ON household_members;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.user_household_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT household_id FROM household_members WHERE user_id = _user_id
$$;

-- Create new policies using security definer functions
CREATE POLICY "Users can view household members if they are members" 
ON household_members 
FOR SELECT 
TO authenticated
USING (household_id IN (SELECT public.user_household_ids(auth.uid())));

CREATE POLICY "Household originators can manage members" 
ON household_members 
FOR ALL 
TO authenticated
USING (household_id IN (
  SELECT id FROM households WHERE originator_id = auth.uid()
))
WITH CHECK (household_id IN (
  SELECT id FROM households WHERE originator_id = auth.uid()
));

-- Ensure the trigger for creating default households exists and works
CREATE OR REPLACE FUNCTION public.create_default_household()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_household_id UUID;
BEGIN
  -- Create default household
  INSERT INTO public.households (name, originator_id)
  VALUES ('My Household', NEW.user_id)
  RETURNING id INTO new_household_id;
  
  -- Add user as originator member
  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (new_household_id, NEW.user_id, 'originator');
  
  -- Set as current household
  UPDATE public.profiles 
  SET current_household_id = new_household_id 
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_household();
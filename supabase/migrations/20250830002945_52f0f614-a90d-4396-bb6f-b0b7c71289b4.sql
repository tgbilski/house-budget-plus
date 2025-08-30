-- Fix security definer functions by setting search_path
CREATE OR REPLACE FUNCTION public.create_default_household()
RETURNS TRIGGER
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

-- Fix security definer function by setting search_path
CREATE OR REPLACE FUNCTION public.accept_household_invite(_invite_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Get invite details
  SELECT * INTO invite_record 
  FROM public.household_invites 
  WHERE id = _invite_id 
  AND (invited_user_id = auth.uid() OR invited_email = auth.email())
  AND status = 'pending'
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Add user to household
  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (invite_record.household_id, auth.uid(), 'member')
  ON CONFLICT (household_id, user_id) DO NOTHING;
  
  -- Update invite status
  UPDATE public.household_invites 
  SET status = 'accepted', 
      invited_user_id = auth.uid(),
      updated_at = now()
  WHERE id = _invite_id;
  
  RETURN TRUE;
END;
$$;
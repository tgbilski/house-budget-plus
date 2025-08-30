-- Create households table
CREATE TABLE public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  originator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create household members table
CREATE TABLE public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'originator', 'member'
  can_edit BOOLEAN NOT NULL DEFAULT true,
  can_view BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(household_id, user_id)
);

-- Create household invites table
CREATE TABLE public.household_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'expired'
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add household_id to existing tables that should be household-specific
ALTER TABLE public.budget_data ADD COLUMN household_id UUID REFERENCES public.households(id) ON DELETE CASCADE;
ALTER TABLE public.gift_lists ADD COLUMN household_id UUID REFERENCES public.households(id) ON DELETE CASCADE;
ALTER TABLE public.savings_goals ADD COLUMN household_id UUID REFERENCES public.households(id) ON DELETE CASCADE;
ALTER TABLE public.vacation_projects ADD COLUMN household_id UUID REFERENCES public.households(id) ON DELETE CASCADE;
ALTER TABLE public.vendor_projects ADD COLUMN household_id UUID REFERENCES public.households(id) ON DELETE CASCADE;
ALTER TABLE public.challenges ADD COLUMN household_id UUID REFERENCES public.households(id) ON DELETE CASCADE;
ALTER TABLE public.daily_checkins ADD COLUMN household_id UUID REFERENCES public.households(id) ON DELETE CASCADE;

-- Add current_household_id to profiles table
ALTER TABLE public.profiles ADD COLUMN current_household_id UUID REFERENCES public.households(id);

-- Enable RLS on new tables
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_invites ENABLE ROW LEVEL SECURITY;

-- Create policies for households
CREATE POLICY "Users can view households they belong to" ON public.households
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.household_members 
      WHERE household_id = households.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own households" ON public.households
  FOR INSERT WITH CHECK (auth.uid() = originator_id);

CREATE POLICY "Originators can update their households" ON public.households
  FOR UPDATE USING (auth.uid() = originator_id);

CREATE POLICY "Originators can delete their households" ON public.households
  FOR DELETE USING (auth.uid() = originator_id);

-- Create policies for household members
CREATE POLICY "Users can view members of their households" ON public.household_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm2 
      WHERE hm2.household_id = household_members.household_id 
      AND hm2.user_id = auth.uid()
    )
  );

CREATE POLICY "Originators can manage household members" ON public.household_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.households 
      WHERE id = household_members.household_id 
      AND originator_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own membership" ON public.household_members
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for household invites
CREATE POLICY "Users can view invites for their households or sent to them" ON public.household_invites
  FOR SELECT USING (
    auth.uid() = invited_by 
    OR auth.uid() = invited_user_id 
    OR auth.email() = invited_email
    OR EXISTS (
      SELECT 1 FROM public.households 
      WHERE id = household_invites.household_id 
      AND originator_id = auth.uid()
    )
  );

CREATE POLICY "Originators can create invites" ON public.household_invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.households 
      WHERE id = household_invites.household_id 
      AND originator_id = auth.uid()
    )
  );

CREATE POLICY "Invite recipients can update invites" ON public.household_invites
  FOR UPDATE USING (
    auth.uid() = invited_user_id 
    OR auth.email() = invited_email
  );

-- Create function to create default household for new users
CREATE OR REPLACE FUNCTION public.create_default_household()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create default household when profile is created
CREATE TRIGGER create_default_household_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_household();

-- Create function to handle household invite acceptance
CREATE OR REPLACE FUNCTION public.accept_household_invite(_invite_id UUID)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX idx_household_members_user_id ON public.household_members(user_id);
CREATE INDEX idx_household_members_household_id ON public.household_members(household_id);
CREATE INDEX idx_household_invites_email ON public.household_invites(invited_email);
CREATE INDEX idx_household_invites_user_id ON public.household_invites(invited_user_id);

-- Update triggers for updated_at
CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_household_members_updated_at
  BEFORE UPDATE ON public.household_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_household_invites_updated_at
  BEFORE UPDATE ON public.household_invites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
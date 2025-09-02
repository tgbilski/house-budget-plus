-- Fix RLS policies to prevent infinite recursion
DROP POLICY IF EXISTS "Originators can manage household members" ON household_members;
DROP POLICY IF EXISTS "Users can view members of their households" ON household_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON household_members;

-- Create new non-recursive policies for household_members
CREATE POLICY "Members can view household members"
ON household_members FOR SELECT
USING (household_id IN (
  SELECT household_id FROM household_members WHERE user_id = auth.uid()
));

CREATE POLICY "Originators can insert household members"
ON household_members FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM households 
  WHERE id = household_id AND originator_id = auth.uid()
));

CREATE POLICY "Originators can update household members"
ON household_members FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM households 
  WHERE id = household_id AND originator_id = auth.uid()
));

CREATE POLICY "Originators can delete household members"
ON household_members FOR DELETE
USING (EXISTS (
  SELECT 1 FROM households 
  WHERE id = household_id AND originator_id = auth.uid()
));

CREATE POLICY "Users can update their own membership"
ON household_members FOR UPDATE
USING (user_id = auth.uid());
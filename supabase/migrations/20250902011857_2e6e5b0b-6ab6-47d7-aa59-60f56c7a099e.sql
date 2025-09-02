-- Fix the household RLS policies 
DROP POLICY IF EXISTS "Users can create their own households" ON households;
DROP POLICY IF EXISTS "Originators can update their households" ON households;
DROP POLICY IF EXISTS "Originators can delete their households" ON households;
DROP POLICY IF EXISTS "Users can view households they belong to" ON households;

-- Create simpler policies that work with the current structure
CREATE POLICY "Authenticated users can create households"
ON households FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = originator_id);

CREATE POLICY "Originators can update their households"
ON households FOR UPDATE
TO authenticated
USING (auth.uid() = originator_id);

CREATE POLICY "Originators can delete their households"
ON households FOR DELETE
TO authenticated
USING (auth.uid() = originator_id);

CREATE POLICY "Users can view households they belong to"
ON households FOR SELECT
TO authenticated
USING (
  auth.uid() = originator_id OR 
  EXISTS (
    SELECT 1 FROM household_members 
    WHERE household_members.household_id = households.id 
    AND household_members.user_id = auth.uid()
  )
);
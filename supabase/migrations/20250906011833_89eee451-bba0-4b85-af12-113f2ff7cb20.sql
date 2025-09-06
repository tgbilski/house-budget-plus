-- Fix household RLS policies to maintain authenticated role restrictions

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view household members if they are members" ON household_members;
DROP POLICY IF EXISTS "Household originators can manage members" ON household_members;
DROP POLICY IF EXISTS "Users can remove themselves from households" ON household_members;

-- Create new policies with authenticated role restrictions
CREATE POLICY "Users can view household members if they are members" 
ON household_members 
FOR SELECT 
TO authenticated
USING (
  household_id IN (
    SELECT hm.household_id 
    FROM household_members hm 
    WHERE hm.user_id = auth.uid()
  )
);

CREATE POLICY "Household originators can manage members" 
ON household_members 
FOR ALL 
TO authenticated
USING (
  household_id IN (
    SELECT h.id 
    FROM households h 
    WHERE h.originator_id = auth.uid()
  )
)
WITH CHECK (
  household_id IN (
    SELECT h.id 
    FROM households h 
    WHERE h.originator_id = auth.uid()
  )
);

CREATE POLICY "Users can remove themselves from households" 
ON household_members 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());
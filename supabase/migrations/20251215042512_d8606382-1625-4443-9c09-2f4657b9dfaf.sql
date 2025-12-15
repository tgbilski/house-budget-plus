-- Allow users to view profiles of members in their households
CREATE POLICY "Users can view profiles of household members"
ON public.profiles
FOR SELECT
USING (
  user_id IN (
    SELECT hm.user_id 
    FROM household_members hm 
    WHERE hm.household_id IN (
      SELECT user_household_ids(auth.uid())
    )
  )
);
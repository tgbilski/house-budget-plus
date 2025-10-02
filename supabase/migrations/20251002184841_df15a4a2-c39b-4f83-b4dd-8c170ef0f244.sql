-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view active listings" ON public.marketplace_listings;

-- Create a new policy that allows everyone (including anonymous users) to view active listings
CREATE POLICY "Anyone can view active listings"
ON public.marketplace_listings
FOR SELECT
USING (status = 'active');

-- Create a separate policy for users to view their own listings (any status)
CREATE POLICY "Users can view their own listings"
ON public.marketplace_listings
FOR SELECT
USING (auth.uid() = user_id);

-- Create a policy for admins to view all listings
CREATE POLICY "Admins can view all listings"
ON public.marketplace_listings
FOR SELECT
USING (has_role(auth.uid(), 'admin'));
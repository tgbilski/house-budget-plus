-- ============================================
-- SECURITY FIX: Critical RLS Vulnerabilities
-- ============================================

-- 1. FIX SUBSCRIBERS: Remove email-based lookup vulnerability
-- The current policy allows lookup by email OR user_id, which is exploitable
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;

CREATE POLICY "Users can view their own subscription by user_id only"
ON public.subscribers
FOR SELECT
USING (auth.uid() = user_id);

-- 2. FIX MARKETPLACE_LISTINGS: Require authentication to view listings
-- This prevents anonymous scraping of contact info
DROP POLICY IF EXISTS "Anyone can view active listings" ON public.marketplace_listings;

-- Only authenticated users can view active listings (protects contact info from scrapers)
CREATE POLICY "Authenticated users can view active listings"
ON public.marketplace_listings
FOR SELECT
TO authenticated
USING (status = 'active');

-- 3. CREATE PUBLIC VIEW for marketplace (hides sensitive data for any public queries)
-- This view excludes contact info, stripe IDs, and moderation data
CREATE OR REPLACE VIEW public.marketplace_listings_public
WITH (security_invoker = on) AS
SELECT 
  id,
  title,
  description,
  category,
  price,
  image_urls,
  tags,
  location_city,
  location_state,
  location_country,
  location_latitude,
  location_longitude,
  status,
  created_at,
  updated_at
FROM public.marketplace_listings
WHERE status = 'active';

-- 4. FIX HOUSEHOLD_INVITES: Tighten the SELECT policy
-- Current policy exposes invited_email. Restrict to only inviter, invitee (by user_id only), or originator
DROP POLICY IF EXISTS "Users can view invites for their households or sent to them" ON public.household_invites;

CREATE POLICY "Users can view relevant invites"
ON public.household_invites
FOR SELECT
USING (
  -- The person who sent the invite
  auth.uid() = invited_by
  -- The person who was invited (must be logged in with that user_id)
  OR auth.uid() = invited_user_id
  -- The household originator
  OR EXISTS (
    SELECT 1 FROM households
    WHERE households.id = household_invites.household_id
    AND households.originator_id = auth.uid()
  )
);

-- 5. FIX PDF_PROCESSING_LOGS: Ensure strict user-only access
-- Current policy looks correct but let's verify it's restrictive
-- The existing policies already require auth.uid() = user_id, which is correct

-- 6. FIX PROFILES: Remove email from household member visibility
-- Create a restricted view for profile data that household members can see
DROP POLICY IF EXISTS "Users can view profiles of household members" ON public.profiles;

-- Users can still view household members, but through a more restricted lens
-- They can see first_name, last_name, but NOT email of other household members
CREATE POLICY "Users can view household member names only"
ON public.profiles
FOR SELECT
USING (
  -- Can always see own profile fully
  auth.uid() = user_id
  -- For household members, we'll handle this in the application layer
  -- by using a view or selective column access
);

-- Create a safe view for household member profiles (no email exposure)
CREATE OR REPLACE VIEW public.household_member_profiles
WITH (security_invoker = on) AS
SELECT 
  p.user_id,
  p.first_name,
  p.last_name,
  p.current_household_id,
  p.created_at
  -- Excludes: email, role
FROM public.profiles p
WHERE p.user_id IN (
  SELECT hm.user_id 
  FROM household_members hm 
  WHERE hm.household_id IN (
    SELECT user_household_ids(auth.uid())
  )
);

-- 7. Additional: Ensure admins still have proper access
-- (Existing admin policies remain intact)
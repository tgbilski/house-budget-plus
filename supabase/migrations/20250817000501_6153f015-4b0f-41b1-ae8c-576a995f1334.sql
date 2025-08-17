-- Remove the overly permissive service role policy
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.subscribers;

-- Create more specific policies for service role operations
-- Allow service role to update subscriber records only when authenticating valid users
CREATE POLICY "Service role can update authenticated user subscriptions" 
ON public.subscribers 
FOR UPDATE 
USING (
  -- Only allow updates when the operation is coming from a service role context
  -- and the user_id and email are properly validated
  auth.role() = 'service_role' AND 
  user_id IS NOT NULL AND 
  email IS NOT NULL AND
  -- Ensure the user_id corresponds to a valid auth user
  EXISTS (SELECT 1 FROM auth.users WHERE id = user_id)
);

-- Allow service role to insert subscriber records for valid users
CREATE POLICY "Service role can insert valid user subscriptions" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (
  auth.role() = 'service_role' AND 
  user_id IS NOT NULL AND 
  email IS NOT NULL AND
  -- Ensure the user_id corresponds to a valid auth user
  EXISTS (SELECT 1 FROM auth.users WHERE id = user_id)
);

-- Strengthen user policies to ensure proper data validation
-- Update existing user policies to be more restrictive
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;

-- Create more secure user policies
CREATE POLICY "Users can insert their own subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  auth.email() = email AND
  user_id IS NOT NULL AND
  email IS NOT NULL
);

CREATE POLICY "Users can update their own subscription" 
ON public.subscribers 
FOR UPDATE 
USING (
  auth.uid() = user_id AND 
  auth.email() = email AND
  user_id IS NOT NULL AND
  email IS NOT NULL
);

-- Add constraints to ensure data integrity
ALTER TABLE public.subscribers 
ADD CONSTRAINT subscribers_user_id_not_null CHECK (user_id IS NOT NULL),
ADD CONSTRAINT subscribers_email_not_null CHECK (email IS NOT NULL);
-- Fix subscribers table security issues
-- 1. Add unique constraint to prevent duplicate user subscriptions
ALTER TABLE public.subscribers 
ADD CONSTRAINT subscribers_user_id_unique UNIQUE (user_id);

-- 2. Update RLS policies to remove privilege escalation vulnerability
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Service role can insert valid user subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can update authenticated user subscriptions" ON public.subscribers;

-- Create secure service role policies that don't allow arbitrary user_id manipulation
CREATE POLICY "Service role can manage subscriptions" 
ON public.subscribers 
FOR ALL 
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- Ensure user policies are more restrictive
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;

CREATE POLICY "Users can insert their own subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND auth.email() = email 
  AND user_id IS NOT NULL 
  AND email IS NOT NULL
);

CREATE POLICY "Users can update their own subscription" 
ON public.subscribers 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND auth.email() = email 
  AND user_id IS NOT NULL 
  AND email IS NOT NULL
) 
WITH CHECK (
  auth.uid() = user_id 
  AND auth.email() = email 
  AND user_id IS NOT NULL 
  AND email IS NOT NULL
);
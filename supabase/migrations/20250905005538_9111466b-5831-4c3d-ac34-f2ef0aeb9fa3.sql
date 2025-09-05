-- Fix household_members RLS policies to prevent unauthorized access
DROP POLICY IF EXISTS "Anyone can view household members" ON public.household_members;
DROP POLICY IF EXISTS "Authenticated users can delete members" ON public.household_members;
DROP POLICY IF EXISTS "Authenticated users can insert members" ON public.household_members;
DROP POLICY IF EXISTS "Authenticated users can update members" ON public.household_members;

-- Create secure RLS policies for household_members
CREATE POLICY "Users can view household members if they are members"
ON public.household_members
FOR SELECT
USING (
  household_id IN (
    SELECT household_id 
    FROM household_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Household originators can manage members"
ON public.household_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM households 
    WHERE id = household_members.household_id 
    AND originator_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM households 
    WHERE id = household_members.household_id 
    AND originator_id = auth.uid()
  )
);

CREATE POLICY "Users can remove themselves from households"
ON public.household_members
FOR DELETE
USING (user_id = auth.uid());

-- Make goal-images bucket private for better security
UPDATE storage.buckets 
SET public = false 
WHERE id = 'goal-images';

-- Drop existing storage policies that may conflict
DROP POLICY IF EXISTS "Users can upload their own goal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own goal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own goal images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own goal images" ON storage.objects;

-- Create secure storage policies for goal-images
CREATE POLICY "Users can view their own goal images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'goal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own goal images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'goal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own goal images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'goal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own goal images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'goal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
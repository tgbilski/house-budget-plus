-- Update all existing profiles to have 'general' role
-- (This ensures any NULL values or confirms the default was applied)
UPDATE profiles 
SET role = 'general'
WHERE role IS NULL OR role = 'general';

-- Verify the update
-- This comment will help track that all users were assigned general role
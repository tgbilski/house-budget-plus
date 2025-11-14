-- Make the goal-images bucket public so blog images can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'goal-images';
-- Add overall_rating column to vacation_options for the grading system
-- Using integer 1-5 to represent vibes/rating

ALTER TABLE public.vacation_options 
ADD COLUMN IF NOT EXISTS overall_rating integer DEFAULT NULL;
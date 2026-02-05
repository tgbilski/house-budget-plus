-- Add latitude and longitude columns to vacation_options for map markers
ALTER TABLE public.vacation_options 
ADD COLUMN IF NOT EXISTS destination_lat numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS destination_lng numeric DEFAULT NULL;
-- Add new cost fields to vacation_options table
ALTER TABLE public.vacation_options 
ADD COLUMN travel_mode_cost numeric DEFAULT 0,
ADD COLUMN lodging_cost numeric DEFAULT 0,
ADD COLUMN car_rental_cost numeric DEFAULT 0;

-- Remove the old estimated_cost column
ALTER TABLE public.vacation_options 
DROP COLUMN estimated_cost;
-- Fix unique constraints for proper upsert functionality with household_id

-- Add unique constraint for budget_data to handle upserts correctly
ALTER TABLE public.budget_data 
DROP CONSTRAINT IF EXISTS budget_data_user_calculator_page_key;

ALTER TABLE public.budget_data 
ADD CONSTRAINT budget_data_user_calculator_page_household_key 
UNIQUE (user_id, calculator_id, page_type, household_id);

-- Add unique constraint for daily_checkins
ALTER TABLE public.daily_checkins 
DROP CONSTRAINT IF EXISTS daily_checkins_user_date_key;

ALTER TABLE public.daily_checkins 
ADD CONSTRAINT daily_checkins_user_date_household_key 
UNIQUE (user_id, date, household_id);

-- Add unique constraint for user_streaks  
ALTER TABLE public.user_streaks 
DROP CONSTRAINT IF EXISTS user_streaks_user_type_key;

ALTER TABLE public.user_streaks 
ADD CONSTRAINT user_streaks_user_type_household_key 
UNIQUE (user_id, streak_type, household_id);
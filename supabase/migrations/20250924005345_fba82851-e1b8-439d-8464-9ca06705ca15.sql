-- Drop the existing unique constraint that doesn't include year
ALTER TABLE public.budget_data DROP CONSTRAINT budget_data_user_calculator_page_household_key;

-- Add a new unique constraint that includes year
ALTER TABLE public.budget_data ADD CONSTRAINT budget_data_user_calculator_page_household_year_key 
UNIQUE (user_id, calculator_id, page_type, household_id, year);
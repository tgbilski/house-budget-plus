-- Add year column to all relevant tables to create hierarchy: User -> Household -> Year -> Data

-- Add year column to budget_data table
ALTER TABLE public.budget_data ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Add year column to savings_goals table  
ALTER TABLE public.savings_goals ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Add year column to savings_entries table
ALTER TABLE public.savings_entries ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Add year column to vendor_projects table
ALTER TABLE public.vendor_projects ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Add year column to vendor_quotes table (inherit from project)
ALTER TABLE public.vendor_quotes ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Add year column to vacation_projects table
ALTER TABLE public.vacation_projects ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Add year column to vacation_options table
ALTER TABLE public.vacation_options ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Add year column to gift_lists table
ALTER TABLE public.gift_lists ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Add year column to challenges table
ALTER TABLE public.challenges ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Add year column to daily_checkins table
ALTER TABLE public.daily_checkins ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Add year column to user_insights table
ALTER TABLE public.user_insights ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Add year column to user_streaks table
ALTER TABLE public.user_streaks ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Add year column to user_badges table
ALTER TABLE public.user_badges ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Add year column to pdf_processing_logs table
ALTER TABLE public.pdf_processing_logs ADD COLUMN year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- Create indexes for better performance on year queries
CREATE INDEX idx_budget_data_user_household_year ON public.budget_data(user_id, household_id, year);
CREATE INDEX idx_savings_goals_user_household_year ON public.savings_goals(user_id, household_id, year);
CREATE INDEX idx_vendor_projects_user_household_year ON public.vendor_projects(user_id, household_id, year);
CREATE INDEX idx_vacation_projects_user_household_year ON public.vacation_projects(user_id, household_id, year);
CREATE INDEX idx_vacation_options_user_year ON public.vacation_options(user_id, year);
CREATE INDEX idx_gift_lists_user_household_year ON public.gift_lists(user_id, household_id, year);
CREATE INDEX idx_challenges_user_household_year ON public.challenges(user_id, household_id, year);
CREATE INDEX idx_daily_checkins_user_household_year ON public.daily_checkins(user_id, household_id, year);
CREATE INDEX idx_user_insights_user_household_year ON public.user_insights(user_id, household_id, year);
CREATE INDEX idx_user_streaks_user_household_year ON public.user_streaks(user_id, household_id, year);
CREATE INDEX idx_user_badges_user_household_year ON public.user_badges(user_id, household_id, year);
CREATE INDEX idx_pdf_processing_logs_user_household_year ON public.pdf_processing_logs(user_id, household_id, year);
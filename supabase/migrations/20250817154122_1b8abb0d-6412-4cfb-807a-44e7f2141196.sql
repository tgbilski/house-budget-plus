-- Add budget target column to gift_lists table
ALTER TABLE public.gift_lists 
ADD COLUMN budget_target numeric DEFAULT 0;
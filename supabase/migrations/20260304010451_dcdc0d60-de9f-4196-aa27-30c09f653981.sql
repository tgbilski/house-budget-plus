
-- Step 1: Remove duplicates keeping only the most recently updated row per user/calculator/page_type/household
DELETE FROM public.budget_data a
USING public.budget_data b
WHERE a.user_id = b.user_id
  AND a.calculator_id = b.calculator_id
  AND a.page_type = b.page_type
  AND COALESCE(a.household_id, '00000000-0000-0000-0000-000000000000') = COALESCE(b.household_id, '00000000-0000-0000-0000-000000000000')
  AND a.id <> b.id
  AND a.updated_at < b.updated_at;

-- Step 2: Drop the old unique constraint that includes year
ALTER TABLE public.budget_data DROP CONSTRAINT budget_data_user_calculator_page_household_year_key;

-- Step 3: Create new unique constraint without year
ALTER TABLE public.budget_data ADD CONSTRAINT budget_data_user_calculator_page_household_key 
  UNIQUE (user_id, calculator_id, page_type, household_id);

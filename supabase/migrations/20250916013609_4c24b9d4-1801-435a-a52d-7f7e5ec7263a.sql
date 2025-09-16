-- Add a goal_number column to savings_goals table to support exactly 3 goals per user
ALTER TABLE public.savings_goals ADD COLUMN goal_number integer;

-- Create a unique constraint to ensure only one goal per number per user/household
ALTER TABLE public.savings_goals ADD CONSTRAINT unique_goal_number_per_user_household 
UNIQUE (user_id, household_id, goal_number);

-- Update existing goals to have goal numbers
WITH numbered_goals AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY user_id, household_id ORDER BY created_at) as rn
  FROM public.savings_goals
)
UPDATE public.savings_goals 
SET goal_number = LEAST(numbered_goals.rn, 3)
FROM numbered_goals 
WHERE public.savings_goals.id = numbered_goals.id;

-- Delete any goals beyond the first 3 per user/household
DELETE FROM public.savings_goals 
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY user_id, household_id ORDER BY created_at) as rn
    FROM public.savings_goals
  ) ranked_goals
  WHERE rn > 3
);

-- Make goal_number NOT NULL now that all existing records have values
ALTER TABLE public.savings_goals ALTER COLUMN goal_number SET NOT NULL;

-- Update the title to be based on goal number
UPDATE public.savings_goals 
SET title = 'Goal ' || goal_number::text;
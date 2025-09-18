-- Add vacation_number to vacation_options table and remove dependency on projects
ALTER TABLE vacation_options ADD COLUMN vacation_number INTEGER;

-- Update existing vacation options to have vacation numbers 1, 2, 3
WITH numbered_options AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) as rn
  FROM vacation_options
)
UPDATE vacation_options 
SET vacation_number = CASE 
  WHEN numbered_options.rn <= 3 THEN numbered_options.rn
  ELSE NULL
END
FROM numbered_options 
WHERE vacation_options.id = numbered_options.id;

-- Delete vacation options beyond the first 3 for each user
DELETE FROM vacation_options 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) as rn
    FROM vacation_options
  ) ranked_options 
  WHERE rn > 3
);

-- Make vacation_number required and add constraint
ALTER TABLE vacation_options ALTER COLUMN vacation_number SET NOT NULL;
ALTER TABLE vacation_options ADD CONSTRAINT vacation_options_vacation_number_check CHECK (vacation_number IN (1, 2, 3));

-- Add user_id directly to vacation_options for simplified structure
ALTER TABLE vacation_options ADD COLUMN user_id UUID;

-- Update user_id from the project relationship
UPDATE vacation_options 
SET user_id = vacation_projects.user_id
FROM vacation_projects 
WHERE vacation_options.project_id = vacation_projects.id;

-- Make user_id required
ALTER TABLE vacation_options ALTER COLUMN user_id SET NOT NULL;

-- Create unique constraint for user + vacation number
ALTER TABLE vacation_options ADD CONSTRAINT vacation_options_user_vacation_unique UNIQUE (user_id, vacation_number);

-- Update RLS policies for the new structure
DROP POLICY IF EXISTS "Users can create options for their own projects" ON vacation_options;
DROP POLICY IF EXISTS "Users can view options for their own projects" ON vacation_options;
DROP POLICY IF EXISTS "Users can update options for their own projects" ON vacation_options;
DROP POLICY IF EXISTS "Users can delete options for their own projects" ON vacation_options;

CREATE POLICY "Users can create their own vacation options" 
ON vacation_options 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own vacation options" 
ON vacation_options 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own vacation options" 
ON vacation_options 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vacation options" 
ON vacation_options 
FOR DELETE 
USING (auth.uid() = user_id);
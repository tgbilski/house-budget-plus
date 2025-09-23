-- Add missing vacation_number column to vacation_projects table
ALTER TABLE vacation_projects ADD COLUMN vacation_number INTEGER;

-- Create unique constraint to ensure proper mapping
CREATE UNIQUE INDEX idx_vacation_projects_user_year_number 
ON vacation_projects(user_id, year, vacation_number);

-- Update existing vacation projects to have proper vacation numbers
UPDATE vacation_projects 
SET vacation_number = (
  SELECT ROW_NUMBER() OVER (
    PARTITION BY user_id, year 
    ORDER BY created_at
  )
  FROM vacation_projects vp2 
  WHERE vp2.id = vacation_projects.id
)
WHERE vacation_number IS NULL;
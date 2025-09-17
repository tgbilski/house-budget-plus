-- Add project_number column to vendor_projects table
ALTER TABLE public.vendor_projects ADD COLUMN project_number integer;

-- Create a unique constraint to ensure only one project per number per user per household
ALTER TABLE public.vendor_projects ADD CONSTRAINT unique_user_household_project_number 
UNIQUE (user_id, household_id, project_number);

-- Update existing projects to have project numbers 1, 2, 3
WITH numbered_projects AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, household_id ORDER BY created_at) as rn
  FROM public.vendor_projects
)
UPDATE public.vendor_projects 
SET project_number = numbered_projects.rn
FROM numbered_projects 
WHERE public.vendor_projects.id = numbered_projects.id
AND numbered_projects.rn <= 3;

-- Delete any projects beyond the third one
DELETE FROM public.vendor_projects 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, household_id ORDER BY created_at) as rn
    FROM public.vendor_projects
  ) ranked
  WHERE rn > 3
);

-- Update titles to be based on project number
UPDATE public.vendor_projects 
SET title = 'Project ' || project_number::text
WHERE project_number IS NOT NULL;
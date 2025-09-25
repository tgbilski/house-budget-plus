-- Remove the incorrect unique constraint that prevents multiple options per vacation
ALTER TABLE vacation_options DROP CONSTRAINT vacation_options_user_vacation_unique;

-- Add a proper unique constraint that allows multiple options per project
-- but prevents duplicate options with the same destination per project
ALTER TABLE vacation_options ADD CONSTRAINT vacation_options_project_destination_unique 
UNIQUE (project_id, destination);
-- Update specific user to admin role
UPDATE profiles 
SET role = 'admin'
WHERE email = 'tgbilski@gmail.com';
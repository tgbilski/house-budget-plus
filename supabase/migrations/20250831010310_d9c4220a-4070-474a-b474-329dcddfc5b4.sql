-- Create trigger to automatically create default household for new users
CREATE TRIGGER create_default_household_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_household();
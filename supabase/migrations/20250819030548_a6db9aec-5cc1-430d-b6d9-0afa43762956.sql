-- Fix function search path security issues
-- Update all functions to have immutable search_path

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles 
     WHERE user_id = auth.uid() 
     ORDER BY CASE role 
       WHEN 'admin' THEN 1 
       WHEN 'moderator' THEN 2 
       WHEN 'user' THEN 3 
     END LIMIT 1), 
    'user'::app_role
  )
$function$;

CREATE OR REPLACE FUNCTION public.delete_user_account(_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Only allow users to delete their own account or admins to delete any account
  IF auth.uid() != _user_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Cannot delete another user''s account';
  END IF;

  -- Delete user data in proper order (reverse of dependencies)
  DELETE FROM public.takeout_transactions WHERE user_id = _user_id;
  DELETE FROM public.gift_items WHERE list_id IN (SELECT id FROM public.gift_lists WHERE user_id = _user_id);
  DELETE FROM public.gift_lists WHERE user_id = _user_id;
  DELETE FROM public.budget_data WHERE user_id = _user_id;
  DELETE FROM public.pdf_processing_logs WHERE user_id = _user_id;
  DELETE FROM public.user_badges WHERE user_id = _user_id;
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  DELETE FROM public.subscribers WHERE user_id = _user_id;
  DELETE FROM public.profiles WHERE user_id = _user_id;

  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$function$;
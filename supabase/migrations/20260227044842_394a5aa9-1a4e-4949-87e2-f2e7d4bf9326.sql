-- Tighten the insert policy to service role only
DROP POLICY "Service role can insert usage" ON public.street_view_usage;

CREATE POLICY "Service role can insert usage"
ON public.street_view_usage
FOR INSERT
WITH CHECK (auth.role() = 'service_role');
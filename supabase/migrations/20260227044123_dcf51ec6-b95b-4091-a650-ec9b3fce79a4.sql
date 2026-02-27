-- Create a table to track Street View API usage
CREATE TABLE public.street_view_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address text NOT NULL,
  user_id uuid,
  status text NOT NULL DEFAULT 'ok',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.street_view_usage ENABLE ROW LEVEL SECURITY;

-- Only admins can view usage logs
CREATE POLICY "Admins can view street view usage"
ON public.street_view_usage
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert (from edge function)
CREATE POLICY "Service role can insert usage"
ON public.street_view_usage
FOR INSERT
WITH CHECK (true);

-- Create index for date-based queries
CREATE INDEX idx_street_view_usage_created_at ON public.street_view_usage (created_at DESC);
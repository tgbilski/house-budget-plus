-- Create reviews/feedback table
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  page_source text DEFAULT 'budget',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone (including guests) can insert reviews
CREATE POLICY "Anyone can submit reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view all reviews
CREATE POLICY "Admins can view all reviews"
  ON public.reviews
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own reviews (if logged in)
CREATE POLICY "Users can view their own reviews"
  ON public.reviews
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add index for admin queries
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX idx_reviews_category ON public.reviews(category);
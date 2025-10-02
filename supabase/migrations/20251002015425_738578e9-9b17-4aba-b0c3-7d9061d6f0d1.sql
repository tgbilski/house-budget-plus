-- Create marketplace_listings table
CREATE TABLE public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('vendor', 'vacation', 'gift')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'flagged', 'rejected', 'expired')),
  report_count INTEGER NOT NULL DEFAULT 0,
  stripe_subscription_id TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  subscription_end TIMESTAMP WITH TIME ZONE,
  moderation_result JSONB,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_reports table for tracking who reported what
CREATE TABLE public.user_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  reporter_user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(listing_id, reporter_user_id)
);

-- Enable RLS
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_listings
CREATE POLICY "Users can view active listings"
ON public.marketplace_listings
FOR SELECT
USING (status = 'active' OR user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own listings"
ON public.marketplace_listings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
ON public.marketplace_listings
FOR UPDATE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any listing"
ON public.marketplace_listings
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_reports
CREATE POLICY "Users can create reports"
ON public.user_reports
FOR INSERT
WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Users can view their own reports"
ON public.user_reports
FOR SELECT
USING (auth.uid() = reporter_user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all reports"
ON public.user_reports
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Trigger to auto-update updated_at
CREATE TRIGGER update_marketplace_listings_updated_at
BEFORE UPDATE ON public.marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-flag listings after 3 reports
CREATE OR REPLACE FUNCTION public.check_listing_reports()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.marketplace_listings
  SET status = 'flagged',
      updated_at = now()
  WHERE id = NEW.listing_id
    AND report_count >= 3
    AND status = 'active';
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_flag_reported_listings
AFTER INSERT ON public.user_reports
FOR EACH ROW
EXECUTE FUNCTION public.check_listing_reports();

-- Function to update report count
CREATE OR REPLACE FUNCTION public.update_report_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.marketplace_listings
  SET report_count = (
    SELECT COUNT(*) 
    FROM public.user_reports 
    WHERE listing_id = NEW.listing_id
  )
  WHERE id = NEW.listing_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_listing_report_count
AFTER INSERT ON public.user_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_report_count();
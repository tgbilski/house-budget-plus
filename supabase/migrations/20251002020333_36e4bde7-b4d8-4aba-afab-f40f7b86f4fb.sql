-- Add location fields to marketplace_listings
ALTER TABLE public.marketplace_listings
ADD COLUMN location_address TEXT,
ADD COLUMN location_latitude NUMERIC,
ADD COLUMN location_longitude NUMERIC,
ADD COLUMN location_city TEXT,
ADD COLUMN location_state TEXT,
ADD COLUMN location_country TEXT;

-- Create index for location searches
CREATE INDEX idx_marketplace_location_city ON public.marketplace_listings(location_city);
CREATE INDEX idx_marketplace_location_state ON public.marketplace_listings(location_state);
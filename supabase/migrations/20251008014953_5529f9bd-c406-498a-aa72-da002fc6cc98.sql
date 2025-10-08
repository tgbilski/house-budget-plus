-- Add tags column to marketplace_listings table
ALTER TABLE public.marketplace_listings
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create an index on tags for better search performance
CREATE INDEX idx_marketplace_listings_tags ON public.marketplace_listings USING GIN(tags);

-- Add a comment to document the tags column
COMMENT ON COLUMN public.marketplace_listings.tags IS 'Tags for categorizing and searching listings (e.g., plumbing, beach house, christmas gifts)';
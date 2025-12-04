-- Add enhanced fields to gift_items table
ALTER TABLE public.gift_items 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'idea' CHECK (status IN ('idea', 'purchased', 'wrapped', 'delivered')),
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'nice_to_have' CHECK (priority IN ('must_have', 'nice_to_have', 'backup')),
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS quantity_purchased integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchased_at timestamp with time zone;

-- Add index for common queries
CREATE INDEX IF NOT EXISTS idx_gift_items_status ON public.gift_items(status);
CREATE INDEX IF NOT EXISTS idx_gift_items_priority ON public.gift_items(priority);
CREATE INDEX IF NOT EXISTS idx_gift_items_category ON public.gift_items(category);
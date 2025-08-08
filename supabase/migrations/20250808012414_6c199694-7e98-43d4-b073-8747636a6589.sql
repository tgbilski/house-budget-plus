-- First, let's create the new structure
-- Create gift_items table for individual gift ideas
CREATE TABLE public.gift_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL,
  gift_idea TEXT,
  price NUMERIC,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on gift_items
ALTER TABLE public.gift_items ENABLE ROW LEVEL SECURITY;

-- Create policies for gift_items - users can only access items from their own lists
CREATE POLICY "Users can view gift items from their own lists" 
ON public.gift_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.gift_lists 
    WHERE gift_lists.id = gift_items.list_id 
    AND gift_lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create gift items in their own lists" 
ON public.gift_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.gift_lists 
    WHERE gift_lists.id = gift_items.list_id 
    AND gift_lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update gift items in their own lists" 
ON public.gift_items 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.gift_lists 
    WHERE gift_lists.id = gift_items.list_id 
    AND gift_lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete gift items from their own lists" 
ON public.gift_items 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.gift_lists 
    WHERE gift_lists.id = gift_items.list_id 
    AND gift_lists.user_id = auth.uid()
  )
);

-- Add trigger for timestamps
CREATE TRIGGER update_gift_items_updated_at
BEFORE UPDATE ON public.gift_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing data to the new structure
INSERT INTO public.gift_items (list_id, gift_idea, price, url, created_at, updated_at)
SELECT id, gift_idea, price, url, created_at, updated_at
FROM public.gift_lists
WHERE gift_idea IS NOT NULL OR price IS NOT NULL OR url IS NOT NULL;

-- Remove the old columns from gift_lists
ALTER TABLE public.gift_lists 
DROP COLUMN gift_idea,
DROP COLUMN price,
DROP COLUMN url;
-- Create gifts table for storing gift ideas by user
CREATE TABLE public.gift_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  list_title TEXT NOT NULL DEFAULT 'Holiday Gifts',
  gift_idea TEXT,
  price NUMERIC(10,2),
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.gift_lists ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own gift lists" 
ON public.gift_lists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own gift lists" 
ON public.gift_lists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gift lists" 
ON public.gift_lists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gift lists" 
ON public.gift_lists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gift_lists_updated_at
BEFORE UPDATE ON public.gift_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
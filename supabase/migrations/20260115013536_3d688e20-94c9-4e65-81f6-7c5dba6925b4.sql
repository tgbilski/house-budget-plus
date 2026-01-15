-- Create new simplified gifts table
CREATE TABLE public.gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  household_id UUID REFERENCES public.households(id),
  occasion TEXT NOT NULL,
  recipient TEXT NOT NULL,
  gift_idea TEXT,
  price NUMERIC(10,2),
  link TEXT,
  notes TEXT,
  purchased BOOLEAN DEFAULT false,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access (includes household members)
CREATE POLICY "Users can view gifts in their households"
ON public.gifts
FOR SELECT
USING (
  household_id IN (SELECT user_household_ids(auth.uid()))
  OR (household_id IS NULL AND auth.uid() = user_id)
);

CREATE POLICY "Users can create gifts in their households"
ON public.gifts
FOR INSERT
WITH CHECK (
  household_id IN (SELECT user_household_ids(auth.uid()))
  OR (household_id IS NULL AND auth.uid() = user_id)
);

CREATE POLICY "Users can update gifts in their households"
ON public.gifts
FOR UPDATE
USING (
  household_id IN (SELECT user_household_ids(auth.uid()))
  OR (household_id IS NULL AND auth.uid() = user_id)
);

CREATE POLICY "Users can delete gifts in their households"
ON public.gifts
FOR DELETE
USING (
  household_id IN (SELECT user_household_ids(auth.uid()))
  OR (household_id IS NULL AND auth.uid() = user_id)
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_gifts_updated_at
BEFORE UPDATE ON public.gifts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_gifts_household_year ON public.gifts(household_id, year);
CREATE INDEX idx_gifts_user_id ON public.gifts(user_id);
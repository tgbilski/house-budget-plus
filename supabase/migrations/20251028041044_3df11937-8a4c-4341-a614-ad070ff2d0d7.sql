-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  household_id UUID NOT NULL,
  year INTEGER NOT NULL DEFAULT EXTRACT(year FROM CURRENT_DATE),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL,
  merchant TEXT,
  category TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own household expenses" 
ON public.expenses 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND household_id IN (SELECT user_household_ids(auth.uid()))
);

CREATE POLICY "Users can create their own household expenses" 
ON public.expenses 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND household_id IN (SELECT user_household_ids(auth.uid()))
);

CREATE POLICY "Users can update their own household expenses" 
ON public.expenses 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND household_id IN (SELECT user_household_ids(auth.uid()))
);

CREATE POLICY "Users can delete their own household expenses" 
ON public.expenses 
FOR DELETE 
USING (
  auth.uid() = user_id 
  AND household_id IN (SELECT user_household_ids(auth.uid()))
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_expenses_user_household_date ON public.expenses(user_id, household_id, date);
CREATE INDEX idx_expenses_year ON public.expenses(year);
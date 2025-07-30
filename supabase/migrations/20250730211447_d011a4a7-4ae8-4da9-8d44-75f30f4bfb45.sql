-- Create dedicated takeout_transactions table
CREATE TABLE public.takeout_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  merchant TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Food & Dining',
  pdf_source TEXT, -- reference to which PDF this came from
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.takeout_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own takeout transactions" 
ON public.takeout_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own takeout transactions" 
ON public.takeout_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own takeout transactions" 
ON public.takeout_transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own takeout transactions" 
ON public.takeout_transactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_takeout_transactions_updated_at
BEFORE UPDATE ON public.takeout_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_takeout_transactions_user_date ON public.takeout_transactions(user_id, date DESC);
CREATE INDEX idx_takeout_transactions_merchant ON public.takeout_transactions(merchant);
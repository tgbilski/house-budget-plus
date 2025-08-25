-- Remove takeout transactions table
DROP TABLE IF EXISTS public.takeout_transactions CASCADE;

-- Create savings goals table
CREATE TABLE public.savings_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  target_amount NUMERIC NOT NULL DEFAULT 0,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  target_date DATE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own savings goals" 
ON public.savings_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own savings goals" 
ON public.savings_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings goals" 
ON public.savings_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings goals" 
ON public.savings_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create savings entries table for monthly tracking
CREATE TABLE public.savings_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  entry_month DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.savings_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for savings entries
CREATE POLICY "Users can view entries for their own goals" 
ON public.savings_entries 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.savings_goals 
  WHERE savings_goals.id = savings_entries.goal_id 
  AND savings_goals.user_id = auth.uid()
));

CREATE POLICY "Users can create entries for their own goals" 
ON public.savings_entries 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.savings_goals 
  WHERE savings_goals.id = savings_entries.goal_id 
  AND savings_goals.user_id = auth.uid()
));

CREATE POLICY "Users can update entries for their own goals" 
ON public.savings_entries 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.savings_goals 
  WHERE savings_goals.id = savings_entries.goal_id 
  AND savings_goals.user_id = auth.uid()
));

CREATE POLICY "Users can delete entries for their own goals" 
ON public.savings_entries 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.savings_goals 
  WHERE savings_goals.id = savings_entries.goal_id 
  AND savings_goals.user_id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_savings_goals_updated_at
BEFORE UPDATE ON public.savings_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_entries_updated_at
BEFORE UPDATE ON public.savings_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for goal images
INSERT INTO storage.buckets (id, name, public) VALUES ('goal-images', 'goal-images', true);

-- Create storage policies
CREATE POLICY "Goal images are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'goal-images');

CREATE POLICY "Users can upload their own goal images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'goal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own goal images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'goal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own goal images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'goal-images' AND auth.uid()::text = (storage.foldername(name))[1]);
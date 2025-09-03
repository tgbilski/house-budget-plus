-- Add household_id to tables that should be scoped by household

-- Add household_id to user_streaks (streaks should be per household)
ALTER TABLE public.user_streaks 
ADD COLUMN household_id UUID REFERENCES public.households(id);

-- Add household_id to user_insights (insights should be per household)
ALTER TABLE public.user_insights 
ADD COLUMN household_id UUID REFERENCES public.households(id);

-- Add household_id to pdf_processing_logs (document processing should be per household)
ALTER TABLE public.pdf_processing_logs 
ADD COLUMN household_id UUID REFERENCES public.households(id);

-- Update RLS policies for user_streaks to include household scoping
DROP POLICY IF EXISTS "Users can update their own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can view their own streaks" ON public.user_streaks;

CREATE POLICY "Users can update their own household streaks" 
ON public.user_streaks 
FOR UPDATE 
USING (auth.uid() = user_id AND household_id IN (
  SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can view their own household streaks" 
ON public.user_streaks 
FOR SELECT 
USING (auth.uid() = user_id AND household_id IN (
  SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert their own household streaks" 
ON public.user_streaks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND household_id IN (
  SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
));

-- Update RLS policies for user_insights to include household scoping
DROP POLICY IF EXISTS "Users can update their own insights" ON public.user_insights;
DROP POLICY IF EXISTS "Users can view their own insights" ON public.user_insights;

CREATE POLICY "Users can view their own household insights" 
ON public.user_insights 
FOR SELECT 
USING (auth.uid() = user_id AND household_id IN (
  SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their own household insights" 
ON public.user_insights 
FOR UPDATE 
USING (auth.uid() = user_id AND household_id IN (
  SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
));

-- Update RLS policies for pdf_processing_logs to include household scoping  
DROP POLICY IF EXISTS "select_own_pdf_logs" ON public.pdf_processing_logs;
DROP POLICY IF EXISTS "insert_own_pdf_logs" ON public.pdf_processing_logs;
DROP POLICY IF EXISTS "update_own_pdf_logs" ON public.pdf_processing_logs;

CREATE POLICY "Users can view their own household pdf logs" 
ON public.pdf_processing_logs 
FOR SELECT 
USING (auth.uid() = user_id AND (household_id IS NULL OR household_id IN (
  SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
)));

CREATE POLICY "Users can insert their own household pdf logs" 
ON public.pdf_processing_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND (household_id IS NULL OR household_id IN (
  SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
)));

CREATE POLICY "Users can update their own household pdf logs" 
ON public.pdf_processing_logs 
FOR UPDATE 
USING (auth.uid() = user_id AND (household_id IS NULL OR household_id IN (
  SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
)));
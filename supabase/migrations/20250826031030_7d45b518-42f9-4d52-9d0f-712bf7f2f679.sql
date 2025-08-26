-- Create table for vendor quotes
CREATE TABLE public.vendor_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.vendor_projects(id) ON DELETE CASCADE,
  vendor_name TEXT DEFAULT '',
  estimate_amount NUMERIC DEFAULT 0,
  contact_info TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  liked_sales_rep BOOLEAN DEFAULT false,
  offers_financing BOOLEAN DEFAULT false,
  good_timing BOOLEAN DEFAULT false,
  trustworthy BOOLEAN DEFAULT false,
  responsive BOOLEAN DEFAULT false,
  date_received DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for vacation options
CREATE TABLE public.vacation_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.vacation_projects(id) ON DELETE CASCADE,
  destination TEXT DEFAULT '',
  travel_mode TEXT DEFAULT '',
  estimated_cost NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  contact TEXT DEFAULT '',
  favorable_travel BOOLEAN DEFAULT false,
  destination_safe BOOLEAN DEFAULT false,
  exciting_option BOOLEAN DEFAULT false,
  everyone_enjoy BOOLEAN DEFAULT false,
  memorable BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vendor_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacation_options ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor_quotes
CREATE POLICY "Users can view quotes for their own projects" 
ON public.vendor_quotes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.vendor_projects 
  WHERE vendor_projects.id = vendor_quotes.project_id 
  AND vendor_projects.user_id = auth.uid()
));

CREATE POLICY "Users can create quotes for their own projects" 
ON public.vendor_quotes 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.vendor_projects 
  WHERE vendor_projects.id = vendor_quotes.project_id 
  AND vendor_projects.user_id = auth.uid()
));

CREATE POLICY "Users can update quotes for their own projects" 
ON public.vendor_quotes 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.vendor_projects 
  WHERE vendor_projects.id = vendor_quotes.project_id 
  AND vendor_projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete quotes for their own projects" 
ON public.vendor_quotes 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.vendor_projects 
  WHERE vendor_projects.id = vendor_quotes.project_id 
  AND vendor_projects.user_id = auth.uid()
));

-- Create policies for vacation_options
CREATE POLICY "Users can view options for their own projects" 
ON public.vacation_options 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.vacation_projects 
  WHERE vacation_projects.id = vacation_options.project_id 
  AND vacation_projects.user_id = auth.uid()
));

CREATE POLICY "Users can create options for their own projects" 
ON public.vacation_options 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.vacation_projects 
  WHERE vacation_projects.id = vacation_options.project_id 
  AND vacation_projects.user_id = auth.uid()
));

CREATE POLICY "Users can update options for their own projects" 
ON public.vacation_options 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.vacation_projects 
  WHERE vacation_projects.id = vacation_options.project_id 
  AND vacation_projects.user_id = auth.uid()
));

CREATE POLICY "Users can delete options for their own projects" 
ON public.vacation_options 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.vacation_projects 
  WHERE vacation_projects.id = vacation_options.project_id 
  AND vacation_projects.user_id = auth.uid()
));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_vendor_quotes_updated_at
BEFORE UPDATE ON public.vendor_quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vacation_options_updated_at
BEFORE UPDATE ON public.vacation_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_vendor_quotes_project_id ON public.vendor_quotes(project_id);
CREATE INDEX idx_vacation_options_project_id ON public.vacation_options(project_id);
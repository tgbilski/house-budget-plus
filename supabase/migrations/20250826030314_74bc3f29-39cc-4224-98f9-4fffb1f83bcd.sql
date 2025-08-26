-- Create table for compare vendor projects
CREATE TABLE public.vendor_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for vacation projects  
CREATE TABLE public.vacation_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vendor_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacation_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor_projects
CREATE POLICY "Users can view their own vendor projects" 
ON public.vendor_projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vendor projects" 
ON public.vendor_projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendor projects" 
ON public.vendor_projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendor projects" 
ON public.vendor_projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for vacation_projects
CREATE POLICY "Users can view their own vacation projects" 
ON public.vacation_projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vacation projects" 
ON public.vacation_projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vacation projects" 
ON public.vacation_projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vacation projects" 
ON public.vacation_projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vendor_projects_updated_at
BEFORE UPDATE ON public.vendor_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vacation_projects_updated_at
BEFORE UPDATE ON public.vacation_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update budget_data table to reference project IDs instead of names
ALTER TABLE public.budget_data ADD COLUMN project_id UUID;

-- Create index for better performance
CREATE INDEX idx_vendor_projects_user_id ON public.vendor_projects(user_id);
CREATE INDEX idx_vacation_projects_user_id ON public.vacation_projects(user_id);
CREATE INDEX idx_budget_data_project_id ON public.budget_data(project_id);
-- Update RLS policies to only allow admins to create/edit blog posts
DROP POLICY IF EXISTS "Users can create their own blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Users can update their own blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Users can delete their own blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Users can view their own blog posts" ON public.blog_posts;

-- Create new restrictive policies
CREATE POLICY "Only admins can create blog posts" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update blog posts" 
ON public.blog_posts 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete blog posts" 
ON public.blog_posts 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));
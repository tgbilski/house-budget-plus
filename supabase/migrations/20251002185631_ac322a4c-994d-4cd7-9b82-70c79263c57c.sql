-- Drop the existing restrictive policy for viewing published blog posts
DROP POLICY IF EXISTS "Published blog posts are viewable by everyone" ON public.blog_posts;

-- Create a new policy that allows anyone (including anonymous users) to view published blog posts
CREATE POLICY "Anyone can view published blog posts"
ON public.blog_posts
FOR SELECT
USING (published = true);

-- Keep the admin policy for viewing all posts
-- (Admins can view all blog posts policy already exists)
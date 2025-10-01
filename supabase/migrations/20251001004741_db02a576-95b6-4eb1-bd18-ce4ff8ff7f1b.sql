-- Update the blog post slug to be more SEO-friendly for beginners
UPDATE public.blog_posts
SET 
  slug = 'creating-house-budget-beginners-guide',
  title = 'Creating a House Budget for Beginners: 7 Fun Steps to Crush Your Savings Goals',
  excerpt = 'New to budgeting? Learn how to create your first house budget with our beginner-friendly guide. Master the 7 essential steps to building a solid budget and achieving your homeownership savings goals, even if you''ve never budgeted before.'
WHERE slug = 'the-7-fun-steps-to-creating-your-house-budget-and-crushing-your-savings-goals';
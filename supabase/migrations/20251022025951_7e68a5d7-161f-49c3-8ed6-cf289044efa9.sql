
-- Remove featured image from holiday shopping blog post
UPDATE blog_posts
SET featured_image_url = NULL,
    updated_at = NOW()
WHERE slug = 'how-to-budget-for-holiday-shopping-without-breaking-the-bank';

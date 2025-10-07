-- Insert the Community Marketplace blog post with a temporary user_id
-- This will need to be updated by an admin or we'll use a trigger to set proper user_id
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Try to get an admin user
  SELECT user_id INTO admin_user_id 
  FROM user_roles 
  WHERE role = 'admin' 
  LIMIT 1;
  
  -- If we have an admin user, use it; otherwise skip insert
  IF admin_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.blog_posts WHERE slug = 'community-marketplace-guide'
  ) THEN
    INSERT INTO public.blog_posts (
      title,
      slug,
      excerpt,
      content,
      published,
      published_at,
      tags,
      read_time,
      user_id
    ) VALUES (
      'Discover Our Community Marketplace: Local Vendors, Vacation Rentals & Handmade Gifts',
      'community-marketplace-guide',
      'Connect with trusted local businesses, discover unique vacation rentals, and shop handmade gifts—all while staying on budget. Our Community Marketplace brings your neighborhood to your fingertips.',
      E'## Why Our Marketplace is Different\n\nTired of scrolling through endless generic listings? Our Community Marketplace is built specifically for budget-conscious households like yours. Every listing is from real people in your area, and because it''s integrated with your House Budget Calculator tools, you can seamlessly plan, compare, and track your spending.\n\n### What Makes Us Special:\n\n- **Hyperlocal Focus**: Find vendors and services right in your neighborhood\n- **Budget-Friendly**: Direct contact means no platform fees driving up costs\n- **Trusted Community**: Verified reviews from fellow budget-conscious users\n- **Integrated Tools**: Connect marketplace finds directly with your budgeting tools\n\n## Find Local Vendors for Your Home Projects\n\nWhether you''re planning a kitchen renovation or need a reliable handyman, our marketplace connects you with local professionals who understand your budget.\n\n### How It Works:\n\n1. **Browse by Category**: Filter by service type, location, and price range\n2. **Read Real Reviews**: See what other budget-conscious homeowners say\n3. **Compare Options**: Use our "Compare Vendors" tool to evaluate multiple quotes side-by-side\n4. **Message Directly**: No middleman fees—contact vendors directly\n\n**Pro Tip**: After finding vendors in the Marketplace, head to our **Compare Vendors** tool to create a detailed comparison chart. You can track quotes, timelines, and reviews all in one place!\n\n## Discover Vacation Rentals That Fit Your Budget\n\nPlanning a getaway? Skip the high fees of big booking platforms. Our marketplace features vacation rentals listed by real homeowners at competitive prices.\n\n### Find Your Perfect Rental:\n\n- **Direct Bookings**: Save 15-20% by booking directly with owners\n- **Detailed Listings**: See real photos, accurate descriptions, and honest reviews\n- **Neighborhood Insights**: Get local tips from homeowners who know the area\n- **Budget Tracking**: Link rentals to your vacation budget planning\n\n**Pro Tip**: Found a rental you love? Use our **Vacation Planner** to create a complete budget breakdown including accommodation, activities, and meals. You can even track savings goals!\n\n## Shop Handmade Gifts from Local Artisans\n\nForget mass-produced gifts. Support local artists and crafters while finding truly unique presents for everyone on your list.\n\n### What You''ll Find:\n\n- **Handcrafted Items**: Jewelry, home decor, artwork, and more\n- **Custom Orders**: Many artisans accept personalized requests\n- **Fair Prices**: Direct-to-consumer pricing means better value\n- **Local Pickup Options**: Save on shipping and support your community\n\n**Pro Tip**: Managing gifts for multiple people? Add marketplace finds directly to your **Gift List Manager**. Track what you''ve purchased, set spending limits per person, and never lose track of your gift-giving budget!\n\n## How to Use the Marketplace\n\n### For Buyers:\n\n1. **Visit the Marketplace**: Navigate from your dashboard or main menu\n2. **Set Your Filters**: Choose category, location, and price range\n3. **Browse Listings**: Click any listing for full details and contact info\n4. **Save Favorites**: Bookmark listings to review later\n5. **Contact Sellers**: Message directly through the platform\n\n### For Sellers:\n\nWant to list your services or products? It''s easy!\n\n1. **Create Your Listing**: Include clear photos and detailed descriptions\n2. **Set Your Price**: Be transparent about costs\n3. **Respond Promptly**: Quick replies build trust\n4. **Build Reviews**: Excellent service leads to great reviews\n\n**Listing fees**: We keep costs low so you can keep prices competitive. Basic listings are included with your subscription!\n\n## Integration with Your Budget Tools\n\nThe real power of our Marketplace comes from its integration with your other budgeting tools:\n\n- **Compare Vendors Tool**: Export marketplace vendors directly to comparison charts\n- **Monthly Budget Tracker**: Log marketplace purchases automatically\n- **Vacation Planner**: Add rental costs to your trip budget\n- **Gift List Manager**: Track marketplace gift purchases against your budget\n- **Savings Goals**: Set goals for marketplace purchases and track progress\n\n## Safety & Trust\n\nYour safety is our priority:\n\n- **Verified Accounts**: All users verify their email addresses\n- **Review System**: Rate and review your experiences\n- **Report Feature**: Flag suspicious listings immediately\n- **Direct Communication**: No financial transactions through the platform—pay how you''re comfortable\n\n## Start Exploring Today\n\nReady to discover what your community has to offer?\n\n**Quick Links:**\n- Browse All Marketplace Listings\n- List Your Business or Services\n- Compare Vendors You''ve Found\n- Plan Your Next Vacation\n- Create a Gift List\n\n## The Bottom Line\n\nOur Community Marketplace isn''t just another listing site—it''s a budget-conscious community hub. By connecting directly with local vendors, vacation rental owners, and artisans, you save money, support your community, and find exactly what you need.\n\nPlus, with seamless integration into your House Budget Calculator tools, you can plan, track, and manage every purchase without jumping between platforms.\n\n**Start browsing today and see how much you can save while supporting local businesses!**',
      true,
      now(),
      ARRAY['marketplace', 'local vendors', 'vacation rentals', 'handmade gifts', 'community'],
      8,
      admin_user_id
    );
  END IF;
END $$;
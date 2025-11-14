// Maps blog post slugs to their featured images
export const blogImageMap: Record<string, string> = {
  'stop-overpaying-the-smart-way-to-compare-home-improvement-estimates': '/blog-images/stop-overpaying-vendors.png',
  'holiday-gift-ideas-budget-planning-2025': '/blog-images/holiday-gifts-2025.png',
  'community-marketplace-guide': '/blog-images/community-marketplace.png',
  'complete-financial-toolkit-family-money-management': '/blog-images/financial-toolkit.png',
  'creating-house-budget-beginners-guide': '/blog-images/house-budget-beginners.png',
};

// Get the featured image URL for a blog post
export const getBlogImageUrl = (slug: string, fallbackUrl?: string): string => {
  return blogImageMap[slug] || fallbackUrl || '/placeholder.svg';
};

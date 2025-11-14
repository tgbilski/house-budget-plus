// Maps blog post slugs to their featured images
export const blogImageMap: Record<string, string> = {
  'stop-overpaying-the-smart-way-to-compare-home-improvement-estimates': '/blog-images/stop-overpaying-vendors.png',
  'holiday-gift-ideas-budget-planning-2025': '/blog-images/holiday-gifts-2025.png',
  'community-marketplace-guide': '/blog-images/community-marketplace.png',
  'complete-financial-toolkit-family-money-management': '/blog-images/financial-toolkit.png',
  'creating-house-budget-beginners-guide': '/blog-images/house-budget-beginners.png',
  'emergency-fund-guide-families': '/lovable-uploads/calculator-preview-hero.png',
  'roof-replacement-vendor-comparison-guide': '/blog-images/stop-overpaying-vendors.png',
  '5-proven-strategies-reach-savings-goals-faster': '/lovable-uploads/5377daa4-3f84-4748-a91b-081403394030.png',
  'household-budget-splitting-guide': '/lovable-uploads/calculator-preview-hero.png',
  'ai-voice-expense-tracking-save-money': '/lovable-uploads/f2d56e66-518b-4a91-8172-551b1a54ef32.png',
  '5-streaming-services-overpaying-how-to-cut-costs': '/lovable-uploads/calculator-preview-hero.png',
  'how-to-budget-for-holiday-shopping-without-breaking-the-bank': '/blog-images/holiday-gifts-2025.png',
  'sleigh-ride-or-stay-inside-should-you-travel-for-christmas-or-stay-home': '/lovable-uploads/new-house-background.png',
  'budget-savvy-traveler-weighing-your-vacation-options-for-maximum-savings': '/lovable-uploads/new-house-background.png',
  'don-t-just-dive-in-why-weighing-house-remodel-options-is-crucial-for-your-wallet-your-peace-of-mind': '/lovable-uploads/new-house-background.png',
};

// Get the featured image URL for a blog post
export const getBlogImageUrl = (slug: string, fallbackUrl?: string): string => {
  return blogImageMap[slug] || fallbackUrl || '/placeholder.svg';
};

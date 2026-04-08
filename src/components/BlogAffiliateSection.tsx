import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { trackAffiliateClick } from '@/utils/analytics';

const AMAZON_TAG = 'housebudgetca-20';

const blogProducts = [
  {
    title: 'Budget Planner & Organizer',
    description: 'Top-rated monthly planner to track spending offline.',
    asin: 'B0B68RNYDQ',
    tag: 'blog-planner',
  },
  {
    title: 'Total Money Makeover',
    description: "Dave Ramsey's bestselling guide to getting out of debt.",
    asin: '1595555277',
    tag: 'blog-ramsey',
  },
  {
    title: 'Cash Envelope Wallet',
    description: 'RFID blocking wallet with 12 budget envelopes.',
    asin: 'B08TZ2YQZ4',
    tag: 'blog-wallet',
  },
  {
    title: '100 Envelope Savings Challenge',
    description: 'Fun visual way to save $5,050.',
    asin: 'B0CHDPMHR7',
    tag: 'blog-challenge',
  },
];

const BlogAffiliateSection: React.FC = () => {
  const handleClick = (product: typeof blogProducts[0]) => {
    trackAffiliateClick(product.tag, product.asin, 'blog_post', product.title);
    window.open(
      `https://www.amazon.com/dp/${product.asin}?tag=${AMAZON_TAG}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="my-8 p-4 bg-muted/30 rounded-xl border-2 border-border/50">
      <h3 className="text-base font-bold text-foreground mb-1">📒 Recommended Budgeting Tools</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Tools our readers love • We may earn a commission
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {blogProducts.map((product) => (
          <Card
            key={product.tag}
            className="border border-border/50 bg-card cursor-pointer transition-all hover:border-primary/50 hover:shadow-md group overflow-hidden"
            onClick={() => handleClick(product)}
          >
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-white flex items-center justify-center border border-border/30">
                <img
                  src={`https://images-na.ssl-images-amazon.com/images/P/${product.asin}.01._SCLZZZZZZZ_SX160_.jpg`}
                  alt={product.title}
                  loading="lazy"
                  className="w-full h-full object-contain p-0.5"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground leading-tight">{product.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{product.description}</p>
                <span className="text-xs font-medium text-primary mt-0.5 inline-flex items-center gap-1 group-hover:underline">
                  Shop on Amazon <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BlogAffiliateSection;

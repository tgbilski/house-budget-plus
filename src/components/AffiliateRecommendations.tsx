import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { trackAffiliateClick } from '@/utils/analytics';
import { Button } from '@/components/ui/button';

const AMAZON_TAG = 'housebudgetca-20';

const amazonImg = (asin: string) =>
  `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_SX160_.jpg`;

const amazonUrl = (asin: string) =>
  `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;

const fallbackCategoryIcon: Record<Recommendation['category'], string> = {
  finance: '💸',
  budgeting: '📒',
  home: '🏠',
  auto: '🚗',
  office: '🗂️',
};

interface Recommendation {
  title: string;
  description: string;
  cta: string;
  asin: string;
  tag: string;
  category: 'finance' | 'budgeting' | 'home' | 'auto' | 'office';
}

const recommendations: Recommendation[] = [
  // Finance (non-Amazon, no ASIN images)
  // Budgeting
  {
    title: 'Budget Planner & Organizer',
    description: 'Top-rated monthly budget planner to track spending offline.',
    cta: 'Shop on Amazon →',
    asin: 'B0B68RNYDQ',
    tag: 'amazon-planner',
    category: 'budgeting',
  },
  {
    title: 'Total Money Makeover',
    description: "Dave Ramsey's bestselling guide to getting out of debt fast.",
    cta: 'Get the book →',
    asin: '1595555277',
    tag: 'amazon-ramsey',
    category: 'budgeting',
  },
  {
    title: 'Cash Envelope Wallet System',
    description: 'RFID blocking wallet with 12 tabbed envelopes & budget cards.',
    cta: 'Shop on Amazon →',
    asin: 'B08TZ2YQZ4',
    tag: 'amazon-envelopes',
    category: 'budgeting',
  },
  {
    title: 'TI BA II Plus Calculator',
    description: 'The go-to financial calculator for loan & mortgage math.',
    cta: 'Shop on Amazon →',
    asin: 'B00000JZKB',
    tag: 'amazon-calculator',
    category: 'budgeting',
  },
  {
    title: 'Richest Man in Babylon',
    description: 'Timeless money lessons in an easy parable format.',
    cta: 'Get the book →',
    asin: '1505339111',
    tag: 'amazon-babylon',
    category: 'budgeting',
  },
  {
    title: '100 Envelope Savings Challenge',
    description: 'Pre-numbered cash envelopes to save $5,050 — fun & visual.',
    cta: 'Shop on Amazon →',
    asin: 'B0CHDPMHR7',
    tag: 'amazon-savings-challenge',
    category: 'budgeting',
  },
  // Home Ownership
  {
    title: 'Home Tool Kit (128pc)',
    description: 'Essential toolkit every homeowner needs for quick repairs.',
    cta: 'Shop on Amazon →',
    asin: 'B09Z21RXJ1',
    tag: 'amazon-home-tools',
    category: 'home',
  },
  {
    title: 'Home Maintenance Log Book',
    description: '12 years of record keeping for repairs, upgrades & schedules.',
    cta: 'Shop on Amazon →',
    asin: '1699668604',
    tag: 'amazon-home-binder',
    category: 'home',
  },
  {
    title: 'ecobee Smart Thermostat',
    description: 'Save up to 23% on heating/cooling — works with Alexa & Siri.',
    cta: 'Shop on Amazon →',
    asin: 'B09XXTQPXC',
    tag: 'amazon-thermostat',
    category: 'home',
  },
  {
    title: 'LED Light Bulbs (12-Pack)',
    description: 'Cut your electricity bill — LED bulbs use 75% less energy.',
    cta: 'Shop on Amazon →',
    asin: 'B0CDGYV7GS',
    tag: 'amazon-led',
    category: 'home',
  },
  {
    title: 'GoveeLife Water Leak Detector',
    description: 'Prevent costly water damage with smart WiFi leak alerts.',
    cta: 'Shop on Amazon →',
    asin: 'B0FPQX6V1X',
    tag: 'amazon-leak-detector',
    category: 'home',
  },
  // Auto
  {
    title: 'Car Maintenance Log Book',
    description: 'Track oil changes, repairs, mileage & expenses in one place.',
    cta: 'Shop on Amazon →',
    asin: 'B0DD387T51',
    tag: 'amazon-car-log',
    category: 'auto',
  },
  {
    title: 'ANCEL OBD2 Scanner',
    description: 'Read check-engine codes yourself — skip the $100 dealer fee.',
    cta: 'Shop on Amazon →',
    asin: 'B0CCXBSK6S',
    tag: 'amazon-obd2',
    category: 'auto',
  },
  {
    title: 'AstroAI Tire Pressure Gauge',
    description: 'Proper tire pressure saves gas — up to 3% better mileage.',
    cta: 'Shop on Amazon →',
    asin: 'B07Y9HS7GT',
    tag: 'amazon-tire-gauge',
    category: 'auto',
  },
  {
    title: 'Roadside Emergency Kit',
    description: 'Jumper cables, first aid, tow rope — 127 pieces, be prepared.',
    cta: 'Shop on Amazon →',
    asin: 'B08BXJ27WH',
    tag: 'amazon-car-kit',
    category: 'auto',
  },
  // Office
  {
    title: 'File Cabinet Organizer',
    description: 'Keep tax docs, receipts, and bills organized in one place.',
    cta: 'Shop on Amazon →',
    asin: 'B0DSVD21L7',
    tag: 'amazon-file-cabinet',
    category: 'office',
  },
  {
    title: 'Brother Label Maker',
    description: 'Organize files, bins, and folders like a pro.',
    cta: 'Shop on Amazon →',
    asin: 'B0B1KZ9KBS',
    tag: 'amazon-label-maker',
    category: 'office',
  },
  {
    title: 'Cross-Cut Paper Shredder',
    description: 'Protect your identity — shred old financial statements.',
    cta: 'Shop on Amazon →',
    asin: 'B09P9VDH7N',
    tag: 'amazon-shredder',
    category: 'office',
  },
  {
    title: '12-in-1 Desk Organizer Set',
    description: 'Stapler, tape, scissors, pen holder — all matching.',
    cta: 'Shop on Amazon →',
    asin: 'B0CM62QKVS',
    tag: 'amazon-desk-organizer',
    category: 'office',
  },
];

const categoryLabels: Record<string, string> = {
  budgeting: '📒 Budgeting Tools & Books',
  home: '🏠 Home Ownership Essentials',
  auto: '🚗 Car Ownership Savings',
  office: '🗂️ Office & Organization',
};

const categoryOrder = ['budgeting', 'home', 'auto', 'office'];

interface AffiliateRecommendationsProps {
  totalIncome?: number;
  totalExpenses?: number;
  className?: string;
}

export const AffiliateRecommendations: React.FC<AffiliateRecommendationsProps> = ({
  totalIncome = 0,
  totalExpenses = 0,
  className = '',
}) => {
  const surplus = totalIncome - totalExpenses;
  const hasData = totalIncome > 0 || totalExpenses > 0;
  const [expanded, setExpanded] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleClick = (tag: string, asin: string, title: string) => {
    trackAffiliateClick(tag, asin, 'recommendations_grid', title);
    window.open(amazonUrl(asin), '_blank', 'noopener,noreferrer');
  };

  const getMessage = () => {
    if (!hasData) return "Smart tools to level up your finances 🚀";
    if (surplus > 500) return "Nice surplus! Here's how to make your money work harder 💪";
    if (surplus > 0) return "Every dollar counts — these tools can stretch your budget further 🎯";
    if (surplus < 0) return "Tight budget? These tools can help you find extra cash 💡";
    return "Smart moves to level up your finances 🚀";
  };

  // Show first 4 by default, all when expanded
  const visibleRecs = expanded ? recommendations : recommendations.slice(0, 4);
  const grouped = categoryOrder
    .map((cat) => ({
      key: cat,
      label: categoryLabels[cat],
      items: visibleRecs.filter((r) => r.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-bold text-foreground">{getMessage()}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Recommended resources based on your budget • We may earn a commission
        </p>
      </div>

      {grouped.map((group) => (
        <div key={group.key} className="space-y-3">
          <h4 className="text-base font-bold text-foreground">{group.label}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.items.map((rec) => (
              <Card
                key={rec.tag}
                className="border-2 border-border/50 bg-card cursor-pointer transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 group overflow-hidden"
                onClick={() => handleClick(rec.tag, rec.asin, rec.title)}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-white flex items-center justify-center border-2 border-border/20 shadow-sm">
                    {failedImages[rec.tag] ? (
                      <div className="w-full h-full bg-muted text-foreground flex flex-col items-center justify-center px-1 text-center">
                        <span className="text-2xl leading-none">{fallbackCategoryIcon[rec.category]}</span>
                        <span className="mt-1 text-[10px] font-medium leading-tight line-clamp-2">
                          {rec.title}
                        </span>
                      </div>
                    ) : (
                      <img
                        src={amazonImg(rec.asin)}
                        alt={rec.title}
                        loading="lazy"
                        width={96}
                        height={96}
                        className="w-full h-full object-contain p-1.5"
                        onError={() => {
                          setFailedImages((prev) => ({ ...prev, [rec.tag]: true }));
                        }}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <h4 className="text-sm sm:text-base font-bold text-foreground leading-tight">{rec.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-snug line-clamp-2">{rec.description}</p>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-foreground bg-primary rounded-full px-3 py-1 group-hover:opacity-90 transition-opacity">
                      {rec.cta}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground"
        >
          {expanded ? (
            <>Show Less <ChevronUp className="h-4 w-4 ml-1" /></>
          ) : (
            <>Show All {recommendations.length} Products <ChevronDown className="h-4 w-4 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
};

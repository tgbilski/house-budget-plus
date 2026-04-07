import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, TrendingUp, PiggyBank, CreditCard, Shield, Home, Car, Briefcase, BookOpen, Calculator, Wrench, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';
import { Button } from '@/components/ui/button';
import affiliateFinance from '@/assets/affiliate-finance.jpg';
import affiliateBudgeting from '@/assets/affiliate-budgeting.jpg';
import affiliateHome from '@/assets/affiliate-home.jpg';
import affiliateAuto from '@/assets/affiliate-auto.jpg';
import affiliateOffice from '@/assets/affiliate-office.jpg';

interface Recommendation {
  title: string;
  description: string;
  cta: string;
  icon: React.ReactNode;
  color: string;
  url: string;
  tag: string;
  category: 'finance' | 'budgeting' | 'home' | 'auto' | 'office';
}

const AMAZON_TAG = 'housebudgetca-20';

const recommendations: Recommendation[] = [
  // Finance
  {
    title: 'High-Yield Savings Account',
    description: 'Earn 4.5%+ APY on your savings instead of the usual 0.01%.',
    cta: 'Compare rates →',
    icon: <PiggyBank className="h-5 w-5" />,
    color: 'text-emerald-600',
    url: 'https://www.nerdwallet.com/best/banking/high-yield-online-savings-accounts',
    tag: 'savings',
    category: 'finance',
  },
  {
    title: 'Cash Back Credit Cards',
    description: 'Get 1-5% back on purchases you\'re already making.',
    cta: 'See top picks →',
    icon: <CreditCard className="h-5 w-5" />,
    color: 'text-blue-600',
    url: 'https://www.nerdwallet.com/best/credit-cards/cash-back',
    tag: 'credit-card',
    category: 'finance',
  },
  {
    title: 'Lower Your Bills',
    description: 'Negotiate bills and cancel unused subscriptions automatically.',
    cta: 'Check it out →',
    icon: <Shield className="h-5 w-5" />,
    color: 'text-amber-600',
    url: 'https://www.nerdwallet.com/article/finance/trim-financial-manager-review',
    tag: 'bills',
    category: 'finance',
  },
  // Budgeting
  {
    title: 'Budget Planner & Organizer',
    description: 'Top-rated monthly budget planner to track spending offline.',
    cta: 'Shop on Amazon →',
    icon: <FileText className="h-5 w-5" />,
    color: 'text-orange-600',
    url: `https://www.amazon.com/s?k=budget+planner+organizer&tag=${AMAZON_TAG}`,
    tag: 'amazon-planner',
    category: 'budgeting',
  },
  {
    title: 'Total Money Makeover',
    description: 'Dave Ramsey\'s bestselling guide to getting out of debt fast.',
    cta: 'Get the book →',
    icon: <BookOpen className="h-5 w-5" />,
    color: 'text-green-600',
    url: `https://www.amazon.com/Total-Money-Makeover-Classic-Financial/dp/1595555277?tag=${AMAZON_TAG}`,
    tag: 'amazon-ramsey',
    category: 'budgeting',
  },
  {
    title: 'Cash Envelope System',
    description: 'Physical cash envelopes for the envelope budgeting method.',
    cta: 'Shop on Amazon →',
    icon: <PiggyBank className="h-5 w-5" />,
    color: 'text-pink-600',
    url: `https://www.amazon.com/s?k=cash+envelope+system+budget&tag=${AMAZON_TAG}`,
    tag: 'amazon-envelopes',
    category: 'budgeting',
  },
  {
    title: 'Financial Calculator',
    description: 'Texas Instruments financial calculator for loan & mortgage math.',
    cta: 'Shop on Amazon →',
    icon: <Calculator className="h-5 w-5" />,
    color: 'text-indigo-600',
    url: `https://www.amazon.com/s?k=financial+calculator&tag=${AMAZON_TAG}`,
    tag: 'amazon-calculator',
    category: 'budgeting',
  },
  {
    title: 'Richest Man in Babylon',
    description: 'Timeless money lessons in an easy parable format.',
    cta: 'Get the book →',
    icon: <BookOpen className="h-5 w-5" />,
    color: 'text-yellow-700',
    url: `https://www.amazon.com/Richest-Man-Babylon-George-Clason/dp/1505339111?tag=${AMAZON_TAG}`,
    tag: 'amazon-babylon',
    category: 'budgeting',
  },
  {
    title: 'Debt-Free Tracker Poster',
    description: 'Colorful wall chart to visualize your debt payoff journey.',
    cta: 'Shop on Amazon →',
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'text-teal-600',
    url: `https://www.amazon.com/s?k=debt+free+tracker+poster&tag=${AMAZON_TAG}`,
    tag: 'amazon-debt-tracker',
    category: 'budgeting',
  },
  // Home Ownership
  {
    title: 'Home Maintenance Kit',
    description: 'Essential toolkit every homeowner needs for quick repairs.',
    cta: 'Shop on Amazon →',
    icon: <Wrench className="h-5 w-5" />,
    color: 'text-red-600',
    url: `https://www.amazon.com/s?k=home+maintenance+tool+kit&tag=${AMAZON_TAG}`,
    tag: 'amazon-home-tools',
    category: 'home',
  },
  {
    title: 'Home Binder & Organizer',
    description: 'Track warranties, manuals, and maintenance schedules.',
    cta: 'Shop on Amazon →',
    icon: <Home className="h-5 w-5" />,
    color: 'text-sky-600',
    url: `https://www.amazon.com/s?k=home+binder+organizer+maintenance&tag=${AMAZON_TAG}`,
    tag: 'amazon-home-binder',
    category: 'home',
  },
  {
    title: 'Smart Thermostat',
    description: 'Save up to 23% on heating/cooling bills with smart scheduling.',
    cta: 'Shop on Amazon →',
    icon: <Home className="h-5 w-5" />,
    color: 'text-cyan-600',
    url: `https://www.amazon.com/s?k=smart+thermostat+energy+saving&tag=${AMAZON_TAG}`,
    tag: 'amazon-thermostat',
    category: 'home',
  },
  {
    title: 'LED Light Bulbs (Value Pack)',
    description: 'Cut your electricity bill — LED bulbs use 75% less energy.',
    cta: 'Shop on Amazon →',
    icon: <Home className="h-5 w-5" />,
    color: 'text-amber-500',
    url: `https://www.amazon.com/s?k=LED+light+bulbs+value+pack&tag=${AMAZON_TAG}`,
    tag: 'amazon-led',
    category: 'home',
  },
  {
    title: 'Water Leak Detector',
    description: 'Prevent costly water damage with early leak alerts.',
    cta: 'Shop on Amazon →',
    icon: <Shield className="h-5 w-5" />,
    color: 'text-blue-500',
    url: `https://www.amazon.com/s?k=water+leak+detector+smart&tag=${AMAZON_TAG}`,
    tag: 'amazon-leak-detector',
    category: 'home',
  },
  // Auto
  {
    title: 'Car Maintenance Log Book',
    description: 'Track oil changes, repairs, and mileage to keep costs down.',
    cta: 'Shop on Amazon →',
    icon: <Car className="h-5 w-5" />,
    color: 'text-slate-600',
    url: `https://www.amazon.com/s?k=car+maintenance+log+book&tag=${AMAZON_TAG}`,
    tag: 'amazon-car-log',
    category: 'auto',
  },
  {
    title: 'OBD2 Car Diagnostic Scanner',
    description: 'Read check-engine codes yourself — skip the $100 dealer fee.',
    cta: 'Shop on Amazon →',
    icon: <Car className="h-5 w-5" />,
    color: 'text-gray-700',
    url: `https://www.amazon.com/s?k=obd2+car+diagnostic+scanner&tag=${AMAZON_TAG}`,
    tag: 'amazon-obd2',
    category: 'auto',
  },
  {
    title: 'Tire Pressure Gauge',
    description: 'Proper tire pressure saves gas — up to 3% better mileage.',
    cta: 'Shop on Amazon →',
    icon: <Car className="h-5 w-5" />,
    color: 'text-violet-600',
    url: `https://www.amazon.com/s?k=digital+tire+pressure+gauge&tag=${AMAZON_TAG}`,
    tag: 'amazon-tire-gauge',
    category: 'auto',
  },
  {
    title: 'Emergency Car Kit',
    description: 'Jumper cables, flashlight, first aid — be prepared and save.',
    cta: 'Shop on Amazon →',
    icon: <Shield className="h-5 w-5" />,
    color: 'text-rose-600',
    url: `https://www.amazon.com/s?k=emergency+car+kit+roadside&tag=${AMAZON_TAG}`,
    tag: 'amazon-car-kit',
    category: 'auto',
  },
  // Office
  {
    title: 'File Cabinet Organizer',
    description: 'Keep tax docs, receipts, and bills organized in one place.',
    cta: 'Shop on Amazon →',
    icon: <Briefcase className="h-5 w-5" />,
    color: 'text-stone-600',
    url: `https://www.amazon.com/s?k=file+cabinet+organizer+home+office&tag=${AMAZON_TAG}`,
    tag: 'amazon-file-cabinet',
    category: 'office',
  },
  {
    title: 'Label Maker',
    description: 'Organize files, bins, and folders like a pro.',
    cta: 'Shop on Amazon →',
    icon: <Briefcase className="h-5 w-5" />,
    color: 'text-fuchsia-600',
    url: `https://www.amazon.com/s?k=label+maker+home+office&tag=${AMAZON_TAG}`,
    tag: 'amazon-label-maker',
    category: 'office',
  },
  {
    title: 'Shredder for Documents',
    description: 'Protect your identity — shred old financial statements.',
    cta: 'Shop on Amazon →',
    icon: <Shield className="h-5 w-5" />,
    color: 'text-neutral-600',
    url: `https://www.amazon.com/s?k=paper+shredder+home+office&tag=${AMAZON_TAG}`,
    tag: 'amazon-shredder',
    category: 'office',
  },
  {
    title: 'Desk Organizer Set',
    description: 'Declutter your workspace for maximum productivity.',
    cta: 'Shop on Amazon →',
    icon: <Briefcase className="h-5 w-5" />,
    color: 'text-emerald-500',
    url: `https://www.amazon.com/s?k=desk+organizer+set+office&tag=${AMAZON_TAG}`,
    tag: 'amazon-desk-organizer',
    category: 'office',
  },
];

const categoryLabels: Record<string, string> = {
  finance: '💰 Financial Products',
  budgeting: '📒 Budgeting Tools & Books',
  home: '🏠 Home Ownership Essentials',
  auto: '🚗 Car Ownership Savings',
  office: '🗂️ Office & Organization',
};

const categoryImages: Record<string, string> = {
  finance: affiliateFinance,
  budgeting: affiliateBudgeting,
  home: affiliateHome,
  auto: affiliateAuto,
  office: affiliateOffice,
};

const categoryOrder = ['finance', 'budgeting', 'home', 'auto', 'office'];

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

  const handleClick = (tag: string, url: string) => {
    trackEvent('affiliate_click', {
      recommendation: tag,
      surplus: surplus,
      income: totalIncome,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
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
          <div className="flex items-center gap-3">
            <img
              src={categoryImages[group.key]}
              alt={group.label}
              loading="lazy"
              width={64}
              height={64}
              className="w-16 h-16 rounded-xl object-cover border-2 border-border/50 flex-shrink-0"
            />
            <h4 className="text-base font-bold text-foreground">{group.label}</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.items.map((rec) => (
              <Card
                key={rec.tag}
                className="border-2 border-border/50 bg-card cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md group"
                onClick={() => handleClick(rec.tag, rec.url)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-muted/50 ${rec.color} flex-shrink-0`}>
                    {rec.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-foreground leading-tight">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{rec.description}</p>
                    <span className="text-xs font-medium text-primary mt-1 inline-flex items-center gap-1 group-hover:underline">
                      {rec.cta}
                      <ExternalLink className="h-3 w-3" />
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
            <>Show All {recommendations.length} Recommendations <ChevronDown className="h-4 w-4 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
};

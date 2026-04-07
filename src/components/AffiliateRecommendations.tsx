import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, TrendingUp, PiggyBank, CreditCard, Shield } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

interface Recommendation {
  title: string;
  description: string;
  cta: string;
  icon: React.ReactNode;
  color: string;
  url: string;
  tag: string;
}

const AMAZON_TAG = 'housebudgetca-20';

const recommendations: Recommendation[] = [
  {
    title: 'High-Yield Savings Account',
    description: 'Earn 4.5%+ APY on your savings instead of the usual 0.01%.',
    cta: 'Compare rates →',
    icon: <PiggyBank className="h-5 w-5" />,
    color: 'text-emerald-600',
    url: 'https://www.nerdwallet.com/best/banking/high-yield-online-savings-accounts',
    tag: 'savings',
  },
  {
    title: 'Budget Planner & Organizer',
    description: 'Top-rated monthly budget planner to track spending offline too.',
    cta: 'Shop on Amazon →',
    icon: <PiggyBank className="h-5 w-5" />,
    color: 'text-orange-600',
    url: `https://www.amazon.com/s?k=budget+planner+organizer&tag=${AMAZON_TAG}`,
    tag: 'amazon-planner',
  },
  {
    title: 'Total Money Makeover',
    description: 'Dave Ramsey\'s bestselling guide to getting out of debt fast.',
    cta: 'Get the book →',
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'text-green-600',
    url: `https://www.amazon.com/Total-Money-Makeover-Classic-Financial/dp/1595555277?tag=${AMAZON_TAG}`,
    tag: 'amazon-ramsey',
  },
  {
    title: 'Cash Back Credit Cards',
    description: 'Get 1-5% back on purchases you\'re already making.',
    cta: 'See top picks →',
    icon: <CreditCard className="h-5 w-5" />,
    color: 'text-blue-600',
    url: 'https://www.nerdwallet.com/best/credit-cards/cash-back',
    tag: 'credit-card',
  },
  {
    title: 'Lower Your Bills',
    description: 'Negotiate bills and cancel unused subscriptions automatically.',
    cta: 'Check it out →',
    icon: <Shield className="h-5 w-5" />,
    color: 'text-amber-600',
    url: 'https://www.nerdwallet.com/article/finance/trim-financial-manager-review',
    tag: 'bills',
  },
];

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

  if (!hasData) return null;

  const handleClick = (tag: string, url: string) => {
    trackEvent('affiliate_click', {
      recommendation: tag,
      surplus: surplus,
      income: totalIncome,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Show personalized message based on budget
  const getMessage = () => {
    if (surplus > 500) return "Nice surplus! Here's how to make your money work harder 💪";
    if (surplus > 0) return "Every dollar counts — these tools can stretch your budget further 🎯";
    if (surplus < 0) return "Tight budget? These tools can help you find extra cash 💡";
    return "Smart moves to level up your finances 🚀";
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-bold text-foreground">{getMessage()}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Recommended resources based on your budget • We may earn a commission
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {recommendations.map((rec) => (
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
  );
};

import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackAffiliateClick } from '@/utils/analytics';

const AMAZON_TAG = 'housebudgetca-20';

interface ProductSuggestion {
  title: string;
  reason: string;
  asin: string;
  tag: string;
  cta: string;
}

const spendingTriggers: Record<string, ProductSuggestion[]> = {
  high_housing: [
    {
      title: 'ecobee Smart Thermostat',
      reason: 'Your housing costs are high — save up to 23% on energy bills',
      asin: 'B09XXTQPXC',
      tag: 'popup-thermostat',
      cta: 'Save on Energy →',
    },
    {
      title: 'LED Light Bulbs (12-Pack)',
      reason: 'Cut your electricity bill — LEDs use 75% less energy',
      asin: 'B0CDGYV7GS',
      tag: 'popup-led',
      cta: 'Shop LEDs →',
    },
  ],
  tight_budget: [
    {
      title: 'Total Money Makeover',
      reason: "Your budget is tight — Dave Ramsey's plan has helped millions get out of debt",
      asin: '1595555277',
      tag: 'popup-ramsey',
      cta: 'Get the Book →',
    },
    {
      title: '100 Envelope Savings Challenge',
      reason: 'A fun visual way to save $5,050 — even on a tight budget',
      asin: 'B0CHDPMHR7',
      tag: 'popup-envelopes',
      cta: 'Start the Challenge →',
    },
  ],
  has_surplus: [
    {
      title: 'Budget Planner & Organizer',
      reason: "Nice surplus! A planner can help you grow it even more",
      asin: 'B0B68RNYDQ',
      tag: 'popup-planner',
      cta: 'Level Up Your Budget →',
    },
    {
      title: 'Richest Man in Babylon',
      reason: 'You have extra cash — learn timeless wealth-building principles',
      asin: '1505339111',
      tag: 'popup-babylon',
      cta: 'Get the Book →',
    },
  ],
  default: [
    {
      title: 'Cash Envelope Wallet System',
      reason: 'The #1 tool budgeters swear by — 12 tabbed envelopes with RFID blocking',
      asin: 'B08TZ2YQZ4',
      tag: 'popup-wallet',
      cta: 'Shop on Amazon →',
    },
  ],
};

const ContextualProductPopup: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [product, setProduct] = useState<ProductSuggestion | null>(null);

  useEffect(() => {
    const handleBudgetUpdate = (event: Event) => {
      if (dismissed || visible) return;
      if (!(event instanceof CustomEvent)) return;

      const { income, totalExpenses, housingExpense } = event.detail;
      if (!income || income <= 0) return;

      const surplus = income - (totalExpenses || 0);
      const housingRatio = (housingExpense || 0) / income;

      let category = 'default';
      if (housingRatio > 0.35) category = 'high_housing';
      else if (surplus < 0) category = 'tight_budget';
      else if (surplus > 200) category = 'has_surplus';

      const options = spendingTriggers[category];
      const pick = options[Math.floor(Math.random() * options.length)];
      setProduct(pick);

      // Delay popup by 2 seconds after data entry
      setTimeout(() => setVisible(true), 2000);
    };

    window.addEventListener('budgetUpdate', handleBudgetUpdate);
    return () => window.removeEventListener('budgetUpdate', handleBudgetUpdate);
  }, [dismissed, visible]);

  const handleClick = () => {
    if (!product) return;
    trackAffiliateClick(product.tag, product.asin, 'contextual_popup', product.title);
    window.open(
      `https://www.amazon.com/dp/${product.asin}?tag=${AMAZON_TAG}`,
      '_blank',
      'noopener,noreferrer'
    );
    setDismissed(true);
    setVisible(false);
  };

  if (!visible || !product || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-80 z-50 animate-slide-up">
      <div className="bg-card border-[3px] border-primary/60 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)] overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-primary/10 border-b border-primary/20">
          <span className="text-xs font-bold text-primary flex items-center gap-1.5">
            <ShoppingCart className="h-3.5 w-3.5" /> Smart Suggestion
          </span>
          <button
            onClick={() => { setDismissed(true); setVisible(false); }}
            className="p-1 rounded-full text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="p-3 flex items-start gap-3">
          <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-white border border-border/30 flex items-center justify-center">
            <img
              src={`https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${product.asin}&Format=_SL160_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=${AMAZON_TAG}`}
              alt={product.title}
              className="w-full h-full object-contain p-0.5"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground leading-snug">{product.reason}</p>
            <p className="text-sm font-bold text-foreground mt-1">{product.title}</p>
          </div>
        </div>
        <div className="px-3 pb-3">
          <Button
            size="sm"
            className="w-full font-bold text-sm"
            onClick={handleClick}
          >
            {product.cta} <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </Button>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            Affiliate link • We may earn a commission
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContextualProductPopup;

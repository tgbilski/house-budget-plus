import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, FileText, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { PricingCards } from './PricingCards';

export function SubscriptionBanner() {
  const { subscribed, subscriptionTier, createCheckout, openCustomerPortal, aiQueriesRemaining } = useSubscription();

  if (subscribed) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Premium Active</h3>
              <p className="text-sm text-muted-foreground">
                {subscriptionTier} • {aiQueriesRemaining} AI queries remaining this month
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={openCustomerPortal}>
            Manage Subscription
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950/20 dark:to-orange-950/20">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-foreground">Choose Your Plan</h3>
            </div>
            <p className="text-sm text-muted-foreground">
               Unlock spending trends, year-over-year comparisons, and voice tracking
            </p>
          </div>
        </CardContent>
      </Card>
      
      <PricingCards />
    </div>
  );
}
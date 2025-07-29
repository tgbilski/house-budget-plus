import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crown, FileText, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export function SubscriptionBanner() {
  const { subscribed, subscriptionTier, createCheckout, openCustomerPortal } = useSubscription();

  if (subscribed) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Premium Active</h3>
              <p className="text-sm text-muted-foreground">
                {subscriptionTier} • Unlimited PDF processing with AI categorization
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
    <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950/20 dark:to-orange-950/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-foreground">Upgrade to Premium</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Get unlimited PDF processing with AI-powered expense categorization for just $4.99/month
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-600" />
                <span>Unlimited PDFs</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-600" />
                <span>AI Categorization</span>
              </div>
            </div>
          </div>
          <Button onClick={createCheckout} className="ml-4">
            Upgrade Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
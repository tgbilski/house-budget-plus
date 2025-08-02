import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export function PricingCards() {
  const { createCheckout, subscribed } = useSubscription();

  const handleUpgrade = async () => {
    await createCheckout('monthly');
  };

  if (subscribed) {
    return null; // Don't show pricing if already subscribed
  }

  return (
    <div className="flex justify-center max-w-md mx-auto">
      <Card className="relative ring-2 ring-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Premium Plan
            </CardTitle>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">$2.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Unlimited PDF processing</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>AI expense categorization</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Cancel anytime</span>
            </li>
          </ul>
          <Button 
            onClick={handleUpgrade}
            className="w-full"
          >
            Get Premium Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
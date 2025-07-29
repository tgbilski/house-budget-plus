import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export function PricingCards() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const { createCheckout, subscribed } = useSubscription();

  const handleUpgrade = async (plan: 'monthly' | 'annual') => {
    await createCheckout(plan);
  };

  if (subscribed) {
    return null; // Don't show pricing if already subscribed
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
      {/* Monthly Plan */}
      <Card className={`relative ${selectedPlan === 'monthly' ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Monthly
            </CardTitle>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">$4.99</span>
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
            onClick={() => handleUpgrade('monthly')}
            className="w-full"
            variant={selectedPlan === 'monthly' ? 'default' : 'outline'}
          >
            Get Monthly Plan
          </Button>
        </CardContent>
      </Card>

      {/* Annual Plan */}
      <Card className={`relative ${selectedPlan === 'annual' ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-600" />
              Annual
            </CardTitle>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              20% OFF
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">$47.90</span>
              <span className="text-muted-foreground">/year</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="line-through">$59.88</span> • Save $11.98
            </div>
            <div className="text-sm font-medium text-green-600">
              Equivalent to $3.99/month
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
              <span>2 months free (20% discount)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Cancel anytime</span>
            </li>
          </ul>
          <Button 
            onClick={() => handleUpgrade('annual')}
            className="w-full"
            variant={selectedPlan === 'annual' ? 'default' : 'outline'}
          >
            Get Annual Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
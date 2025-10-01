import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export function PricingCards() {
  const { createCheckout, subscribed } = useSubscription();

  if (subscribed) {
    return null;
  }

  const handleSubscribe = (plan: 'monthly' | 'annual') => {
    createCheckout(plan);
  };

  const features = [
    "Unlimited PDF processing",
    "AI expense categorization",
    "10 AI Insights / Month",
    "Cancel anytime"
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Monthly Plan */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Monthly Plan
          </CardTitle>
          <div className="text-4xl font-bold mt-4">
            $4.99
            <span className="text-base font-normal text-muted-foreground">/month</span>
          </div>
          <div className="text-sm text-transparent font-medium">
            {/* Spacer to align with annual savings line */}
            .
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <Button 
            onClick={() => handleSubscribe('monthly')}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            Get Monthly Plan
          </Button>
        </CardContent>
      </Card>

      {/* Annual Plan */}
      <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/20 relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
            Best Value
          </span>
        </div>
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Annual Plan
          </CardTitle>
          <div className="text-4xl font-bold mt-4">
            $39.99
            <span className="text-base font-normal text-muted-foreground">/year</span>
          </div>
          <div className="text-sm text-green-600 font-medium">
            Save $19.89 (33% off)
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <Button 
            onClick={() => handleSubscribe('annual')}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            Get Annual Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap, Sparkles } from 'lucide-react';
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
    "Share Households",
    "Voice Expense Tracking",
    "25 AI Insights / Month",
    "Cancel anytime"
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Monthly Plan */}
      <Card 
        className="border-4 border-black bg-white cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] hover:-translate-x-1 hover:-translate-y-1 group"
        onClick={() => handleSubscribe('monthly')}
      >
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <Zap className="h-6 w-6 text-amber-500 group-hover:animate-pulse" />
            Monthly Plan
          </CardTitle>
          <div className="text-5xl font-black mt-4 text-foreground">
            $4.99
            <span className="text-base font-normal text-muted-foreground">/month</span>
          </div>
          <div className="text-sm text-transparent font-medium select-none">
            .
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-1">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
          <div className="pt-4 text-center text-sm text-muted-foreground group-hover:text-primary transition-colors font-medium">
            Let's do this →
          </div>
        </CardContent>
      </Card>

      {/* Annual Plan */}
      <Card 
        className="border-4 border-black bg-gradient-to-br from-amber-50 to-orange-50 relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] hover:-translate-x-1 hover:-translate-y-1 group"
        onClick={() => handleSubscribe('annual')}
      >
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1.5 animate-pulse">
            <Sparkles className="h-4 w-4" />
            Best Value
          </span>
        </div>
        <CardHeader className="text-center pb-6 pt-8">
          <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <Zap className="h-6 w-6 text-amber-500 group-hover:animate-pulse" />
            Annual Plan
          </CardTitle>
          <div className="text-5xl font-black mt-4 text-foreground">
            $39.99
            <span className="text-base font-normal text-muted-foreground">/year</span>
          </div>
          <div className="text-sm text-green-600 font-bold bg-green-100 inline-block px-3 py-1 rounded-full mt-2">
            Save $19.89 (33% off)
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-1">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
          <div className="pt-4 text-center text-sm text-muted-foreground group-hover:text-primary transition-colors font-medium">
            Let's do this →
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
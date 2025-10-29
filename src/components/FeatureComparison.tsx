import React from 'react';
import { Check, X, Crown, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

const features = [
  { name: 'Budget Planning & Tracking Tools', free: true, premium: true },
  { name: 'Savings Goals & Vacation Planner', free: true, premium: true },
  { name: 'Vendor Comparison & Gift Lists', free: true, premium: true },
  { name: 'Community Marketplace Access', free: true, premium: true },
  { name: '10 AI Financial Insights per Month', free: false, premium: true },
  { name: 'Share Budget with Family & Friends', free: false, premium: true },
  { name: 'PDF Budget Exports & Reports', free: false, premium: true },
  { name: 'Downloadable iOS App', free: false, premium: true },
];

export const FeatureComparison: React.FC = () => {
  const { user } = useAuth();
  const { subscribed } = useSubscription();

  return (
    <section className="py-12 md:py-16 px-4 bg-gradient-to-br from-white to-sage/10 rounded-3xl mx-4 my-8 shadow-2xl border border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Choose Your Plan</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Start free and upgrade anytime for advanced features
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card className="border-2 border-border bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8 pt-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/60 rounded-2xl flex items-center justify-center">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold">Free</CardTitle>
              <CardDescription className="text-lg">
                <span className="text-3xl font-bold text-foreground">$0</span>/month
              </CardDescription>
              <p className="text-sm text-muted-foreground mt-2">
                Perfect for getting started
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pb-8">
              {features.map((feature) => (
                <div key={feature.name} className="flex items-start gap-3">
                  {feature.free ? (
                    <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground/30 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={feature.free ? 'text-foreground' : 'text-muted-foreground/50'}>
                    {feature.name}
                  </span>
                </div>
              ))}
              <div className="pt-6">
                {!user && (
                  <Button asChild className="w-full" size="lg">
                    <Link to="/auth">
                      <UserCheck className="mr-2 h-5 w-5" />
                      Sign Up Free
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-primary bg-gradient-to-br from-white to-primary/5 backdrop-blur-sm shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-primary/80 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
              Recommended
            </div>
            <CardHeader className="text-center pb-8 pt-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg">
                  <Crown className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Premium
              </CardTitle>
              <CardDescription className="text-lg">
                <span className="text-3xl font-bold text-foreground">$4.99</span>/month
              </CardDescription>
              <p className="text-sm text-muted-foreground mt-2">
                Or $39.99/year (save 33%)
              </p>
            </CardHeader>
            <CardContent className="space-y-4 pb-8">
              {features.map((feature) => (
                <div key={feature.name} className="flex items-start gap-3">
                  {feature.premium ? (
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground/30 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={feature.premium ? 'text-foreground font-medium' : 'text-muted-foreground/50'}>
                    {feature.name}
                  </span>
                </div>
              ))}
              <div className="pt-6">
                {user && !subscribed && (
                  <Button asChild className="w-full bg-gradient-to-r from-primary to-primary/80" size="lg">
                    <Link to="/settings">
                      <Crown className="mr-2 h-5 w-5" />
                      Upgrade Now
                    </Link>
                  </Button>
                )}
                {!user && (
                  <Button asChild className="w-full bg-gradient-to-r from-primary to-primary/80" size="lg">
                    <Link to="/auth">
                      <Crown className="mr-2 h-5 w-5" />
                      Start Premium Trial
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

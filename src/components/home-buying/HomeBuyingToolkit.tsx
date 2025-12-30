import React, { useState } from 'react';
import { Home, Lock, ChevronRight, Sparkles, PieChart, Calculator, Scale, Car, ShoppingBag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { AffordabilityCheck } from './AffordabilityCheck';
import { BuyingPower } from './BuyingPower';
import { RentVsBuy } from './RentVsBuy';
import { CarAffordability } from './CarAffordability';
import { Link } from 'react-router-dom';

interface HomeBuyingToolkitProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  housingExpense?: number;
  currencySymbol: string;
}

export const HomeBuyingToolkit: React.FC<HomeBuyingToolkitProps> = ({
  monthlyIncome,
  monthlyExpenses,
  housingExpense = 0,
  currencySymbol,
}) => {
  const { subscribed, loading } = useSubscription();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('affordability');

  // Calculate estimated home buying power for teaser
  const annualIncome = monthlyIncome * 12;
  const estimatedHomePrice = annualIncome * 3.5; // Simple 3.5x income estimate

  // Show locked state for non-subscribers
  if (!loading && !subscribed) {
    return (
      <div className="rounded-xl border-[4px] border-stroke shadow-cartoon bg-card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Major Purchase Toolkit</h3>
              <p className="text-sm text-muted-foreground">Premium calculators for homes & cars</p>
            </div>
          </div>
        </div>

        {/* Teaser Content */}
        <div className="p-6">
          {/* Quick Estimate */}
          {monthlyIncome > 0 && (
            <div className="bg-muted/30 rounded-xl p-5 mb-6 border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <p className="text-sm font-medium text-foreground">Quick Estimate</p>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Based on your income, you could afford a home around:</p>
              <p className="text-4xl font-bold text-primary">
                {currencySymbol}{Math.round(estimatedHomePrice).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Unlock detailed calculations with premium
              </p>
            </div>
          )}

          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-xl border border-border/30">
              <Home className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">Home Buying</p>
                <p className="text-xs text-muted-foreground">Affordability, buying power & rent vs buy</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-xl border border-border/30">
              <Car className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">Car Buying</p>
                <p className="text-xs text-muted-foreground">Max price, loan terms & ownership costs</p>
              </div>
            </div>
          </div>

          {/* Unlock CTA */}
          <div className="flex flex-col items-center text-center">
            <Lock className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Unlock the full Major Purchase Toolkit with Premium
            </p>
            {user ? (
              <Link to="/settings">
                <Button className="gap-2 shadow-cartoon border-[3px] border-stroke hover:translate-y-[-2px] hover:shadow-cartoon-hover transition-all">
                  <Sparkles className="h-4 w-4" />
                  Upgrade to Premium
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button className="gap-2 shadow-cartoon border-[3px] border-stroke hover:translate-y-[-2px] hover:shadow-cartoon-hover transition-all">
                  Sign Up to Unlock
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full toolkit for subscribers
  return (
    <div className="rounded-xl border-[4px] border-stroke shadow-cartoon bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">Major Purchase Toolkit</h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">Premium</span>
            </div>
            <p className="text-sm text-muted-foreground">Plan your home & car purchases</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="affordability" className="gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Affordability</span>
          </TabsTrigger>
          <TabsTrigger value="buying-power" className="gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home Power</span>
          </TabsTrigger>
          <TabsTrigger value="rent-vs-buy" className="gap-2">
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">Rent vs Buy</span>
          </TabsTrigger>
          <TabsTrigger value="car" className="gap-2">
            <Car className="h-4 w-4" />
            <span className="hidden sm:inline">Car</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="affordability">
          <AffordabilityCheck
            monthlyIncome={monthlyIncome}
            monthlyExpenses={monthlyExpenses}
            housingExpense={housingExpense}
            currencySymbol={currencySymbol}
          />
        </TabsContent>

        <TabsContent value="buying-power">
          <BuyingPower
            monthlyIncome={monthlyIncome}
            monthlyExpenses={monthlyExpenses}
            currencySymbol={currencySymbol}
          />
        </TabsContent>

        <TabsContent value="rent-vs-buy">
          <RentVsBuy
            monthlyIncome={monthlyIncome}
            currentRent={housingExpense}
            currencySymbol={currencySymbol}
          />
        </TabsContent>

        <TabsContent value="car">
          <CarAffordability
            monthlyIncome={monthlyIncome}
            monthlyExpenses={monthlyExpenses}
            currencySymbol={currencySymbol}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

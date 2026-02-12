import React, { useState, useEffect } from 'react';
import { HelpCircle, Lock, TrendingUp, AlertTriangle, CheckCircle, Home, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MortgagePreapprovalQuestionProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  currency: { symbol: string };
}

// Calculate monthly mortgage payment (P&I) using standard amortization formula
const calculateMonthlyMortgage = (principal: number, annualRate: number, years: number): number => {
  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;
  if (monthlyRate === 0) return principal / numPayments;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
};

export const MortgagePreapprovalQuestion: React.FC<MortgagePreapprovalQuestionProps> = ({
  monthlyIncome,
  monthlyExpenses,
  currency,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('ai-insight-expanded');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('ai-insight-expanded', String(isExpanded));
  }, [isExpanded]);
  const [selectedTier, setSelectedTier] = useState<'low' | 'mid' | 'high'>('mid');
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const navigate = useNavigate();

  const yearlyIncome = monthlyIncome * 12;
  const debtToIncomeRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;

  // Typical American bank preapproval multipliers for moderate to good credit (650-750+ score)
  const lowEstimate = Math.round(yearlyIncome * 2.5);
  const midEstimate = Math.round(yearlyIncome * 3.5);
  const highEstimate = Math.round(yearlyIncome * 4.5);

  // Get selected home price based on tier
  const selectedPrice = selectedTier === 'low' ? lowEstimate : selectedTier === 'mid' ? midEstimate : highEstimate;
  
  // Assume 20% down payment, 7% interest rate, 30-year term
  const downPayment = selectedPrice * 0.20;
  const loanAmount = selectedPrice - downPayment;
  const interestRate = 0.07;
  
  // Calculate monthly costs
  const monthlyMortgage = calculateMonthlyMortgage(loanAmount, interestRate, 30);
  const monthlyPropertyTax = (selectedPrice * 0.011) / 12; // ~1.1% annually (US average)
  const monthlyInsurance = (selectedPrice * 0.005) / 12; // ~0.5% annually
  const totalMonthly = monthlyMortgage + monthlyPropertyTax + monthlyInsurance;

  // Determine financial health message
  const getInsight = () => {
    const futureRatio = monthlyIncome > 0 ? ((monthlyExpenses + totalMonthly) / monthlyIncome) * 100 : 0;
    
    if (debtToIncomeRatio > 43 || futureRatio > 50) {
      return {
        type: 'warning' as const,
        icon: AlertTriangle,
        message: "Based on your current expenses, we recommend aiming for the conservative range. A higher mortgage could stretch your budget thin, leaving little room for emergencies or savings.",
      };
    } else if (debtToIncomeRatio > 36 || futureRatio > 43) {
      return {
        type: 'caution' as const,
        icon: TrendingUp,
        message: "Your finances look manageable, but consider the moderate range to maintain flexibility. This leaves room for unexpected repairs, rate changes, or life events.",
      };
    } else {
      return {
        type: 'good' as const,
        icon: CheckCircle,
        message: "Your debt-to-income ratio is healthy! You have flexibility in choosing your price range. Just remember: a bigger mortgage means less money for other goals.",
      };
    }
  };

  const handleClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowAnswer(true);
  };

  const formatCurrency = (amount: number) => `${currency.symbol}${Math.round(amount).toLocaleString()}`;

  if (monthlyIncome <= 0) return null;

  const insight = getInsight();
  const InsightIcon = insight.icon;

  const tiers = [
    { key: 'low' as const, label: 'Conservative', price: lowEstimate, color: 'bg-success/10 border-success/30 text-success' },
    { key: 'mid' as const, label: 'Moderate', price: midEstimate, color: 'bg-primary/10 border-primary/30 text-primary' },
    { key: 'high' as const, label: 'Aggressive', price: highEstimate, color: 'bg-warning/10 border-warning/30 text-warning' },
  ];

  return (
    <Card className="bg-card overflow-hidden">
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="truncate">AI Financial Insight</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {!showAnswer ? (
          <Button
            variant="outline"
            className="w-full justify-start text-left h-auto py-3 px-3 hover:bg-primary/10 border-primary/30 overflow-hidden"
            onClick={handleClick}
          >
            <Home className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
            <span className="text-xs sm:text-sm font-medium truncate">
              How much can I get preapproved for?
            </span>
          </Button>
        ) : !user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">Sign in for your estimate</span>
            </div>
            <Button onClick={() => navigate('/login')} size="sm">Sign In</Button>
          </div>
        ) : !subscribed ? (
          <div className="bg-background/50 rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-medium text-sm">Premium Feature</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Get personalized mortgage estimates with monthly payment breakdowns.
            </p>
            <Button onClick={() => navigate('/settings')} size="sm" className="w-full">
              Manage Subscription
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Compact Summary - Always visible */}
            <div className="bg-background/50 rounded-lg p-3 border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-semibold text-sm">Preapproval Estimate</span>
                </div>
                <span className="font-bold text-primary text-sm">{formatCurrency(midEstimate)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Est. Monthly Payment</span>
                <span className="font-medium text-foreground">{formatCurrency(totalMonthly)}/mo</span>
              </div>
            </div>

            {/* Expandable Details */}
            <div className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="space-y-3 pt-1">
                {/* Tier Selection */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Based on {formatCurrency(yearlyIncome)}/year income (650+ credit)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {tiers.map((tier) => (
                      <button
                        key={tier.key}
                        onClick={() => setSelectedTier(tier.key)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          selectedTier === tier.key 
                            ? `${tier.color} border-2 scale-[1.02]` 
                            : 'bg-background/50 border-border hover:bg-muted/50'
                        }`}
                      >
                        <div className="text-[10px] text-muted-foreground">{tier.label}</div>
                        <div className={`font-bold text-xs ${selectedTier === tier.key ? '' : 'text-foreground'}`}>
                          {formatCurrency(tier.price)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monthly Cost Breakdown */}
                <div className="bg-background/50 rounded-lg p-3 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-semibold text-sm">Monthly Costs</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Assuming 20% down ({formatCurrency(downPayment)}), 7% rate, 30-yr
                  </p>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Mortgage (P&I)</span>
                      <span className="font-medium">{formatCurrency(monthlyMortgage)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Property Tax</span>
                      <span className="font-medium">{formatCurrency(monthlyPropertyTax)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Insurance</span>
                      <span className="font-medium">{formatCurrency(monthlyInsurance)}</span>
                    </div>
                    <div className="border-t border-border pt-1.5 mt-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold">Total Monthly</span>
                        <span className="font-bold text-primary">{formatCurrency(totalMonthly)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insight */}
                <div className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
                  insight.type === 'warning' ? 'bg-destructive/10 text-destructive' :
                  insight.type === 'caution' ? 'bg-warning/10 text-warning' :
                  'bg-success/10 text-success'
                }`}>
                  <InsightIcon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <p className="leading-relaxed">{insight.message}</p>
                </div>

                {/* Disclaimer */}
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <strong>Note:</strong> Estimates only. Actual costs vary by location, credit score, 
                  lender, and market conditions. Consult a mortgage professional.
                </p>
              </div>
            </div>

            {/* Show More/Less Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show Details
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

import React, { useState } from 'react';
import { HelpCircle, Lock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface MortgagePreapprovalQuestionProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  currency: { symbol: string };
}

export const MortgagePreapprovalQuestion: React.FC<MortgagePreapprovalQuestionProps> = ({
  monthlyIncome,
  monthlyExpenses,
  currency,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const { user } = useAuth();
  const { subscribed, loading, createCheckout } = useSubscription();
  const navigate = useNavigate();

  const yearlyIncome = monthlyIncome * 12;
  const yearlyExpenses = monthlyExpenses * 12;
  const debtToIncomeRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;

  // Typical American bank preapproval multipliers for moderate to good credit (650-750+ score)
  // Conservative: 2.5x, Moderate: 3.5x, Aggressive: 4.5x annual income
  const conservativeMultiplier = 2.5;
  const moderateMultiplier = 3.5;
  const aggressiveMultiplier = 4.5;

  const lowEstimate = Math.round(yearlyIncome * conservativeMultiplier);
  const midEstimate = Math.round(yearlyIncome * moderateMultiplier);
  const highEstimate = Math.round(yearlyIncome * aggressiveMultiplier);

  // Determine financial health message
  const getInsight = () => {
    if (debtToIncomeRatio > 43) {
      return {
        type: 'warning',
        icon: AlertTriangle,
        message: `Your current expenses are ${debtToIncomeRatio.toFixed(0)}% of your income. Most lenders prefer a debt-to-income ratio below 43%. We suggest aiming for the lower end of this range (${currency.symbol}${lowEstimate.toLocaleString()}) to avoid being stretched thin financially.`,
        recommendation: 'conservative',
      };
    } else if (debtToIncomeRatio > 36) {
      return {
        type: 'caution',
        icon: TrendingUp,
        message: `Your debt-to-income ratio is ${debtToIncomeRatio.toFixed(0)}%, which is acceptable but leaves less room for unexpected expenses. Consider targeting the lower-to-mid range (${currency.symbol}${lowEstimate.toLocaleString()} - ${currency.symbol}${midEstimate.toLocaleString()}) to maintain financial flexibility.`,
        recommendation: 'moderate',
      };
    } else {
      return {
        type: 'good',
        icon: CheckCircle,
        message: `Your debt-to-income ratio of ${debtToIncomeRatio.toFixed(0)}% is healthy! You have more flexibility in your preapproval range. However, remember that a higher mortgage means higher monthly payments, property taxes, and maintenance costs.`,
        recommendation: 'flexible',
      };
    }
  };

  const handleClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!subscribed) {
      setShowAnswer(true);
      return;
    }
    
    setShowAnswer(true);
  };

  const formatCurrency = (amount: number) => {
    return `${currency.symbol}${amount.toLocaleString()}`;
  };

  if (monthlyIncome <= 0) {
    return null;
  }

  const insight = getInsight();
  const InsightIcon = insight.icon;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          AI Financial Insight
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showAnswer ? (
          <Button
            variant="outline"
            className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-primary/10 border-primary/30"
            onClick={handleClick}
          >
            <span className="text-sm font-medium">
              💰 How much can I get preapproved for a mortgage?
            </span>
          </Button>
        ) : !user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span className="text-sm">Sign in to see your personalized estimate</span>
            </div>
            <Button onClick={() => navigate('/auth')} size="sm">
              Sign In
            </Button>
          </div>
        ) : !subscribed ? (
          <div className="space-y-4">
            <div className="bg-background/50 rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Premium Feature</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Get personalized mortgage preapproval estimates based on your income data. 
                Subscribe to unlock AI-powered financial insights.
              </p>
              <Button onClick={() => createCheckout()} size="sm" className="w-full">
                Subscribe to Unlock
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-background/50 rounded-lg p-4 border border-border">
              <h4 className="font-semibold text-sm mb-3">Estimated Preapproval Range</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Based on your yearly household income of {formatCurrency(yearlyIncome)} 
                and assuming moderate to good credit (650+ score)
              </p>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-green-500/10 rounded-lg">
                  <div className="text-xs text-muted-foreground">Conservative</div>
                  <div className="font-bold text-sm text-green-600">{formatCurrency(lowEstimate)}</div>
                </div>
                <div className="text-center p-2 bg-blue-500/10 rounded-lg">
                  <div className="text-xs text-muted-foreground">Moderate</div>
                  <div className="font-bold text-sm text-blue-600">{formatCurrency(midEstimate)}</div>
                </div>
                <div className="text-center p-2 bg-orange-500/10 rounded-lg">
                  <div className="text-xs text-muted-foreground">Aggressive</div>
                  <div className="font-bold text-sm text-orange-600">{formatCurrency(highEstimate)}</div>
                </div>
              </div>

              <div className={`flex items-start gap-2 p-3 rounded-lg ${
                insight.type === 'warning' ? 'bg-destructive/10 text-destructive' :
                insight.type === 'caution' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' :
                'bg-green-500/10 text-green-700 dark:text-green-400'
              }`}>
                <InsightIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs">{insight.message}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              <strong>Disclaimer:</strong> This is an estimate based on general lending guidelines. 
              Actual preapproval amounts vary based on credit score, employment history, down payment, 
              existing debts, and lender-specific criteria. Consult with a mortgage professional for accurate quotes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

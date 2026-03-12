import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/lib/utils';

interface MortgagePreapprovalCardProps {
  monthlyIncome: number;
  housingExpense: number;
  totalExpenses: number;
}

export const MortgagePreapprovalCard: React.FC<MortgagePreapprovalCardProps> = ({
  monthlyIncome,
  housingExpense,
  totalExpenses,
}) => {
  const { currency } = useCurrency();

  if (monthlyIncome <= 0) return null;

  const grossMonthly = monthlyIncome;
  const housingRatio = (housingExpense / grossMonthly) * 100;
  const debtRatio = (totalExpenses / grossMonthly) * 100;

  // 28% rule for housing, 36% rule for total debt
  const maxHousing28 = grossMonthly * 0.28;
  const maxDebt36 = grossMonthly * 0.36;

  const housingOk = housingRatio <= 28;
  const debtOk = debtRatio <= 36;

  // Affordability tiers based on annual income
  const annualIncome = grossMonthly * 12;
  const conservative = annualIncome * 3;
  const moderate = annualIncome * 4;
  const aggressive = annualIncome * 5;

  const formatAmount = (amount: number) =>
    `${currency.symbol}${Math.round(amount).toLocaleString()}`;

  return (
    <Card className="border-[3px] border-stroke shadow-cartoon bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          Mortgage Preapproval Estimate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* DTI Ratios */}
        <div className="grid grid-cols-2 gap-3">
          <div className={cn(
            "rounded-lg p-3 border-2",
            housingOk ? "bg-success/5 border-success/30" : "bg-destructive/5 border-destructive/30"
          )}>
            <div className="flex items-center gap-1.5 mb-1">
              {housingOk ? <CheckCircle className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
              <span className="text-xs font-semibold uppercase tracking-wide">Housing (28% rule)</span>
            </div>
            <p className="text-lg font-bold">{housingRatio.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">
              Max: {formatAmount(maxHousing28)}/mo
            </p>
          </div>

          <div className={cn(
            "rounded-lg p-3 border-2",
            debtOk ? "bg-success/5 border-success/30" : "bg-destructive/5 border-destructive/30"
          )}>
            <div className="flex items-center gap-1.5 mb-1">
              {debtOk ? <CheckCircle className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
              <span className="text-xs font-semibold uppercase tracking-wide">Total DTI (36% rule)</span>
            </div>
            <p className="text-lg font-bold">{debtRatio.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">
              Max: {formatAmount(maxDebt36)}/mo
            </p>
          </div>
        </div>

        {/* Affordability Tiers */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Home Affordability Estimate
          </p>
          <div className="space-y-2">
            {[
              { label: 'Conservative', multiplier: '3×', amount: conservative, color: 'bg-success/10 text-success' },
              { label: 'Moderate', multiplier: '4×', amount: moderate, color: 'bg-primary/10 text-primary' },
              { label: 'Aggressive', multiplier: '5×', amount: aggressive, color: 'bg-warning/10 text-warning' },
            ].map((tier) => (
              <div key={tier.label} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded", tier.color)}>
                    {tier.multiplier}
                  </span>
                  <span className="text-sm font-medium">{tier.label}</span>
                </div>
                <span className="text-sm font-bold">{formatAmount(tier.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground italic">
          Based on {formatAmount(annualIncome)}/yr income. Actual preapproval depends on credit, down payment, and lender requirements.
        </p>
      </CardContent>
    </Card>
  );
};

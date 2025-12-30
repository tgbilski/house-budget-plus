import React from 'react';
import { Home, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AffordabilityCheckProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  housingExpense: number;
  currencySymbol: string;
}

export const AffordabilityCheck: React.FC<AffordabilityCheckProps> = ({
  monthlyIncome,
  monthlyExpenses,
  housingExpense,
  currencySymbol,
}) => {
  // Calculate housing expense percentage
  const housingPercent = monthlyIncome > 0 ? (housingExpense / monthlyIncome) * 100 : 0;
  const recommendedPercent = 28;
  const maxPercent = 36;
  
  // Determine status
  const isHealthy = housingPercent <= recommendedPercent;
  const isWarning = housingPercent > recommendedPercent && housingPercent <= maxPercent;
  const isDanger = housingPercent > maxPercent;
  
  // Calculate room to grow
  const recommendedHousing = monthlyIncome * (recommendedPercent / 100);
  const roomToGrow = recommendedHousing - housingExpense;
  
  // Calculate max affordable housing payment
  const maxAffordable = monthlyIncome * (recommendedPercent / 100);

  const getStatusColor = () => {
    if (isDanger) return 'text-red-500';
    if (isWarning) return 'text-amber-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (isDanger) return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (isWarning) return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  };

  const getProgressColor = () => {
    if (isDanger) return 'bg-red-500';
    if (isWarning) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Main Gauge */}
      <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-foreground">Housing Expense Ratio</h4>
          </div>
          {getStatusIcon()}
        </div>

        {/* Gauge visualization */}
        <div className="relative mb-4">
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${Math.min(housingPercent, 100)}%` }}
            />
          </div>
          {/* 28% marker */}
          <div 
            className="absolute top-0 h-6 w-0.5 bg-foreground/60 -mt-1"
            style={{ left: '28%' }}
          />
          <div 
            className="absolute top-6 text-xs text-muted-foreground"
            style={{ left: '28%', transform: 'translateX(-50%)' }}
          >
            28% ideal
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-6">
          <span className={`text-4xl font-bold ${getStatusColor()}`}>
            {housingPercent.toFixed(1)}%
          </span>
          <span className="text-muted-foreground">of income goes to housing</span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Housing */}
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <p className="text-sm text-muted-foreground mb-1">Current Housing Cost</p>
          <p className="text-2xl font-bold text-foreground">
            {currencySymbol}{housingExpense.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground">/month</span>
          </p>
        </div>

        {/* Recommended Max */}
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <p className="text-sm text-muted-foreground mb-1">Recommended Max (28%)</p>
          <p className="text-2xl font-bold text-foreground">
            {currencySymbol}{maxAffordable.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground">/month</span>
          </p>
        </div>
      </div>

      {/* Insight */}
      <div className={`rounded-xl p-4 ${
        isHealthy ? 'bg-green-500/10 border border-green-500/20' :
        isWarning ? 'bg-amber-500/10 border border-amber-500/20' :
        'bg-red-500/10 border border-red-500/20'
      }`}>
        <div className="flex items-start gap-3">
          <TrendingUp className={`h-5 w-5 mt-0.5 ${getStatusColor()}`} />
          <div>
            <p className={`font-medium ${getStatusColor()}`}>
              {isHealthy ? 'Great job!' : isWarning ? 'Getting Close' : 'Over Budget'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isHealthy 
                ? `You have ${currencySymbol}${roomToGrow.toLocaleString()} room to increase your housing budget while staying within the recommended 28% guideline.`
                : roomToGrow < 0
                  ? `You're ${currencySymbol}${Math.abs(roomToGrow).toLocaleString()} over the recommended 28% housing guideline. Consider ways to reduce housing costs or increase income.`
                  : `You're approaching the 28% guideline. Be mindful of any housing cost increases.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* The 28% Rule Explanation */}
      <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
        <h5 className="font-medium text-foreground mb-2">💡 The 28% Rule</h5>
        <p className="text-sm text-muted-foreground">
          Financial experts recommend spending no more than 28% of your gross monthly income on housing costs 
          (including mortgage/rent, property taxes, and insurance). This leaves room for other expenses, 
          savings, and unexpected costs.
        </p>
      </div>
    </div>
  );
};

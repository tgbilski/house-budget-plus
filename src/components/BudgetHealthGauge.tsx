import React from 'react';
import { Sparkles } from 'lucide-react';

interface BudgetHealthGaugeProps {
  income: number;
  totalExpenses: number;
}

export const BudgetHealthGauge: React.FC<BudgetHealthGaugeProps> = ({
  income,
  totalExpenses
}) => {
  const netResult = income - totalExpenses;
  const surplusPercentage = income > 0 ? (netResult / income) * 100 : 0;
  
  // Determine status and colors
  const getGaugeStatus = () => {
    if (netResult < 0) {
      return {
        status: 'danger!',
        color: 'bg-red-500',
        fillHeight: '2%',
        textColor: 'text-red-600',
        showBurst: false
      };
    } else if (surplusPercentage <= 10) {
      return {
        status: 'caution',
        color: 'bg-yellow-500',
        fillHeight: '10%',
        textColor: 'text-yellow-600',
        showBurst: false
      };
    } else if (surplusPercentage <= 20) {
      return {
        status: 'good',
        color: 'bg-blue-500',
        fillHeight: '20%',
        textColor: 'text-blue-600',
        showBurst: false
      };
    } else {
      const fillPercentage = Math.min(surplusPercentage, 100);
      return {
        status: 'excellent!',
        color: 'bg-green-500',
        fillHeight: `${fillPercentage}%`,
        textColor: 'text-green-600',
        showBurst: surplusPercentage > 100
      };
    }
  };

  const gaugeStatus = getGaugeStatus();

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-10">
      <div className="bg-card border border-border rounded-lg p-4 shadow-lg w-20">
        {/* Temperature Gauge */}
        <div className="relative">
          {/* Burst effect for >100% surplus */}
          {gaugeStatus.showBurst && (
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 animate-pulse">
              <Sparkles className="h-6 w-6 text-green-500" />
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-green-500 opacity-60"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 translate-x-1 w-1 h-6 bg-green-400 opacity-40"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-x-1 w-1 h-6 bg-green-400 opacity-40"></div>
            </div>
          )}
          
          {/* Gauge Container */}
          <div className="relative w-8 h-48 bg-gray-200 rounded-full border-2 border-gray-300 mx-auto overflow-hidden">
            {/* Fill */}
            <div
              className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out ${gaugeStatus.color} rounded-full`}
              style={{ height: gaugeStatus.fillHeight }}
            />
            
            {/* Tick marks */}
            <div className="absolute right-0 top-0 h-full w-full">
              {[0, 25, 50, 75, 100].map((mark) => (
                <div
                  key={mark}
                  className="absolute right-0 w-2 h-0.5 bg-gray-400"
                  style={{ top: `${100 - mark}%` }}
                />
              ))}
            </div>
          </div>
          
          {/* Gauge Labels */}
          <div className="absolute -right-8 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>
        </div>
        
        {/* Status Text */}
        <div className="mt-4 text-center">
          <div className={`text-xs font-bold uppercase tracking-wide ${gaugeStatus.textColor}`}>
            {gaugeStatus.status}
          </div>
          
          {/* Percentage Display */}
          <div className="text-xs text-muted-foreground mt-1">
            {surplusPercentage >= 0 ? `+${surplusPercentage.toFixed(1)}%` : `${surplusPercentage.toFixed(1)}%`}
          </div>
          
          {/* Net Amount */}
          <div className={`text-xs font-medium mt-1 ${gaugeStatus.textColor}`}>
            {netResult >= 0 ? `+$${netResult.toFixed(0)}` : `-$${Math.abs(netResult).toFixed(0)}`}
          </div>
        </div>
      </div>
    </div>
  );
};
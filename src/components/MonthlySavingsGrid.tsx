import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency';

interface Props {
  year: string;
  onYearChange: (newYear: string) => void;
  monthlyData: Record<string, number>;
  onUpdateAmount: (monthIndex: number, amount: number | null) => void;
  maxSliderValue?: number;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const generateYears = () => {
  const currentYear = new Date().getFullYear();
  const endYear = Math.max(currentYear + 1, 2026);
  const years: string[] = [];
  for (let year = 2025; year <= endYear; year++) {
    years.push(year.toString());
  }
  return years;
};
const years = generateYears();

export const MonthlySavingsGrid: React.FC<Props> = ({ year, onYearChange, monthlyData, onUpdateAmount, maxSliderValue = 2000 }) => {
  const [localInputs, setLocalInputs] = useState<Record<string, string>>({});
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const { currency } = useCurrency();

  useEffect(() => {
    const inputs = Object.entries(monthlyData).reduce((acc, [key, value]) => {
      acc[key] = value.toString();
      return acc;
    }, {} as Record<string, string>);
    setLocalInputs(inputs);
  }, [monthlyData]);

  const handleInputChange = (monthIndex: number, value: string) => {
    setLocalInputs(prev => ({ ...prev, [monthIndex.toString()]: value }));
  };

  const handleSliderChange = (monthIndex: number, values: number[]) => {
    const value = values[0];
    setLocalInputs(prev => ({ ...prev, [monthIndex.toString()]: value.toString() }));
  };

  const handleSliderCommit = (monthIndex: number, values: number[]) => {
    const value = values[0];
    const currentDbValue = monthlyData[monthIndex.toString()] || 0;
    if (value === 0) {
      if (currentDbValue > 0) {
        onUpdateAmount(monthIndex, null);
      }
    } else if (value !== currentDbValue) {
      onUpdateAmount(monthIndex, value);
    }
  };

  const handleBlur = (monthIndex: number) => {
    const monthKey = monthIndex.toString();
    const inputValue = localInputs[monthKey]?.trim();
    const currentDbValue = monthlyData[monthKey];
    
    if (!inputValue || inputValue === '' || parseFloat(inputValue) === 0) {
      if (currentDbValue && currentDbValue > 0) {
        onUpdateAmount(monthIndex, null);
      }
      setLocalInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[monthKey];
        return newInputs;
      });
      return;
    }
    
    const value = parseFloat(inputValue);
    if (value !== (currentDbValue || 0)) {
      onUpdateAmount(monthIndex, value);
    }
  };

  // Calculate total for the year
  const yearTotal = Object.values(monthlyData).reduce((sum, val) => sum + val, 0);

  return (
    <Card className="bg-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
        <div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-teal bg-clip-text text-transparent">
            Monthly Savings
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {currency.symbol}{yearTotal.toLocaleString()} saved in {year}
          </p>
        </div>
        <Select value={year} onValueChange={onYearChange}>
          <SelectTrigger className="w-28 bg-card border-2 hover:border-teal/40 transition-all">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {months.map((month, index) => {
            const monthKey = index.toString();
            const value = parseFloat(localInputs[monthKey] || '0');
            const isCurrentMonth = parseInt(year) === currentYear && index === currentMonth;
            const hasSavings = value > 0;
            const fillPercent = Math.min((value / maxSliderValue) * 100, 100);
            
            return (
              <div 
                key={month} 
                className={cn(
                  "group relative rounded-xl border-2 p-4 transition-all duration-300",
                  isCurrentMonth 
                    ? "border-teal/50 bg-teal/5 shadow-sm" 
                    : hasSavings 
                    ? "border-success/30 bg-success/5" 
                    : "border-border/40 bg-card hover:border-border/60"
                )}
              >
                {/* Month label */}
                <div className="flex items-center justify-between mb-3">
                  <span className={cn(
                    "text-sm font-bold tracking-wide",
                    isCurrentMonth ? "text-teal" : "text-foreground"
                  )}>
                    {month}
                  </span>
                  <div className="flex items-center gap-2">
                    {isCurrentMonth && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal/20 text-teal px-2 py-0.5 rounded-full">
                        Now
                      </span>
                    )}
                    {hasSavings && (
                      <div className="w-2.5 h-2.5 bg-success rounded-full animate-scale-in" />
                    )}
                  </div>
                </div>

                {/* Amount input */}
                <div className="relative mb-3">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm z-10">
                    {currency.symbol}
                  </span>
                  <Input
                    type="number"
                    value={localInputs[monthKey] || ''}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onBlur={() => handleBlur(index)}
                    className={cn(
                      "pl-7 pr-3 h-11 text-lg font-bold bg-background/50 border-0 border-b-2 rounded-none focus:ring-0 transition-all",
                      hasSavings 
                        ? "border-success/40 text-foreground" 
                        : "border-border/30 text-muted-foreground"
                    )}
                    placeholder="0"
                  />
                </div>

                {/* Slider */}
                <div className="px-1">
                  <Slider
                    value={[value]}
                    min={0}
                    max={maxSliderValue}
                    step={25}
                    onValueChange={(values) => handleSliderChange(index, values)}
                    onValueCommit={(values) => handleSliderCommit(index, values)}
                    className={cn(
                      "cursor-pointer",
                      hasSavings ? "[&_[role=slider]]:bg-success [&_[role=slider]]:border-success" : ""
                    )}
                  />
                </div>

                {/* Progress bar under slider */}
                <div className="mt-2 h-1 rounded-full bg-border/20 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      hasSavings 
                        ? "bg-gradient-to-r from-success to-teal" 
                        : "bg-transparent"
                    )}
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

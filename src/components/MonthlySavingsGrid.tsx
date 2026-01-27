// src/components/MonthlySavingsGrid.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  year: string;
  onYearChange: (newYear: string) => void;
  monthlyData: Record<string, number>;
  onUpdateAmount: (monthIndex: number, amount: number | null) => void;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Generate years based on local time: from 2025 up to current year + 1
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

export const MonthlySavingsGrid: React.FC<Props> = ({ year, onYearChange, monthlyData, onUpdateAmount }) => {
  // Local state to manage input values for a smoother UX
  const [localInputs, setLocalInputs] = useState<Record<string, string>>({});
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const inputs = Object.entries(monthlyData).reduce((acc, [key, value]) => {
      acc[key] = value.toString();
      return acc;
    }, {} as Record<string, string>);
    setLocalInputs(inputs);
  }, [monthlyData]);

  const handleInputChange = (monthIndex: number, value: string) => {
    const monthKey = monthIndex.toString();
    setLocalInputs(prev => ({ ...prev, [monthKey]: value }));
  };

  const handleBlur = (monthIndex: number) => {
    const monthKey = monthIndex.toString();
    const inputValue = localInputs[monthKey]?.trim();
    const currentDbValue = monthlyData[monthKey];
    
    // If input is empty or 0, delete the entry
    if (!inputValue || inputValue === '' || parseFloat(inputValue) === 0) {
      // Only delete if there was a value before
      if (currentDbValue && currentDbValue > 0) {
        onUpdateAmount(monthIndex, null); // null signals deletion
      }
      // Clear local input
      setLocalInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[monthKey];
        return newInputs;
      });
      return;
    }
    
    const value = parseFloat(inputValue);
    // Only call the update function if the value has actually changed
    if (value !== (currentDbValue || 0)) {
      onUpdateAmount(monthIndex, value);
    }
  };

  return (
    <Card className="bg-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-teal bg-clip-text text-transparent">
          Monthly Savings Entries
        </CardTitle>
        <Select value={year} onValueChange={onYearChange}>
          <SelectTrigger className="w-32 bg-card border-2 hover:border-teal/40 transition-all">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {months.map((month, index) => {
            const monthKey = index.toString();
            const value = parseFloat(localInputs[monthKey] || '0');
            const isCurrentMonth = parseInt(year) === currentYear && index === currentMonth;
            const hasSavings = value > 0;
            
            return (
              <div 
                key={month} 
                className="space-y-2 animate-fade-in" 
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <label className={`text-sm font-semibold flex items-center justify-between ${isCurrentMonth ? 'text-teal' : 'text-foreground'}`}>
                  {month}
                  {isCurrentMonth && (
                    <span className="text-xs bg-teal/20 text-teal px-2 py-0.5 rounded-full animate-pulse">
                      Current
                    </span>
                  )}
                </label>
                <div className={`relative group transition-all duration-300 ${isCurrentMonth ? 'animate-pulse' : ''}`}>
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium z-10">$</span>
                  <Input
                    type="number"
                    value={localInputs[monthKey] || ''}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onBlur={() => handleBlur(index)}
                    className={`pl-8 font-semibold bg-card border-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus:border-teal focus:shadow-[var(--shadow-teal)] ${
                      hasSavings 
                        ? 'border-success/60 bg-success/5' 
                        : isCurrentMonth 
                        ? 'border-teal/60' 
                        : 'border-border/60'
                    }`}
                    placeholder="0"
                  />
                  {hasSavings && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white shadow-sm animate-scale-in" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

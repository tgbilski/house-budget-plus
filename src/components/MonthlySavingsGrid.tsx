// src/components/MonthlySavingsGrid.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  year: string;
  onYearChange: (newYear: string) => void;
  monthlyData: Record<string, number>;
  onUpdateAmount: (monthIndex: number, amount: number) => void;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const years = Array.from({ length: 11 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());

export const MonthlySavingsGrid: React.FC<Props> = ({ year, onYearChange, monthlyData, onUpdateAmount }) => {
  // Local state to manage input values for a smoother UX
  const [localInputs, setLocalInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    const inputs = Object.entries(monthlyData).reduce((acc, [key, value]) => {
      acc[key] = value.toString();
      return acc;
    }, {} as Record<string, string>);
    setLocalInputs(inputs);
  }, [monthlyData]);

  const handleInputChange = (monthIndex: number, value: string) => {
    const monthKey = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}`;
    setLocalInputs(prev => ({ ...prev, [monthKey]: value }));
  };

  const handleBlur = (monthIndex: number) => {
    const monthKey = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}`;
    const value = parseFloat(localInputs[monthKey]) || 0;
    // Only call the update function if the value has actually changed
    if (value !== (monthlyData[monthKey] || 0)) {
      onUpdateAmount(monthIndex, value);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Monthly Savings Entries</CardTitle>
        <Select value={year} onValue-change={onYearChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {months.map((month, index) => {
            const monthKey = `${year}-${(index + 1).toString().padStart(2, '0')}`;
            return (
              <div key={month} className="space-y-2">
                <label className="text-sm font-medium">{month}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={localInputs[monthKey] || ''}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onBlur={() => handleBlur(index)}
                    className="pl-7"
                    placeholder="0"
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

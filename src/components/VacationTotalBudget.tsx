import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp } from 'lucide-react';
import type { VacationOption } from '@/hooks/useVacationPlanner';

interface VacationTotalBudgetProps {
  options: VacationOption[];
  currencySymbol: string;
}

export const VacationTotalBudget: React.FC<VacationTotalBudgetProps> = ({
  options,
  currencySymbol,
}) => {
  const calculateTotal = (option: VacationOption) => {
    return (option.travel_mode_cost || 0) + (option.lodging_cost || 0) + (option.car_rental_cost || 0);
  };

  const totals = options.map(calculateTotal);
  const lowestCost = totals.length > 0 ? Math.min(...totals) : 0;
  const highestCost = totals.length > 0 ? Math.max(...totals) : 0;
  const averageCost = totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="border-2 border-success/20 bg-gradient-to-br from-success/5 to-success/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Lowest Option</p>
              <p className="text-2xl font-bold text-success">
                {currencySymbol}{lowestCost.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Cost</p>
              <p className="text-2xl font-bold text-primary">
                {currencySymbol}{averageCost.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Highest Option</p>
              <p className="text-2xl font-bold text-warning">
                {currencySymbol}{highestCost.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-warning rotate-180" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

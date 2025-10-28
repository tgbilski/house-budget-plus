import React from 'react';
import { DollarSign, TrendingUp, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface GiftBudgetSummaryProps {
  totalBudget: number;
  itemCount: number;
  currencySymbol: string;
}

export const GiftBudgetSummary: React.FC<GiftBudgetSummaryProps> = ({
  totalBudget,
  itemCount,
  currencySymbol,
}) => {
  const averagePerGift = itemCount > 0 ? totalBudget / itemCount : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold text-primary">
                {currencySymbol}{totalBudget.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-teal/20 bg-gradient-to-br from-teal/5 to-teal/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold text-teal">
                {itemCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-teal/20 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-teal" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-success/20 bg-gradient-to-br from-success/5 to-success/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg per Gift</p>
              <p className="text-2xl font-bold text-success">
                {currencySymbol}{averagePerGift.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

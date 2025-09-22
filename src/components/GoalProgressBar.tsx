// src/components/GoalProgressCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';

interface SavingsGoal {
  title: string;
  target_amount: number;
}

interface Props {
  currentGoal: SavingsGoal | undefined;
  totalSaved: number;
  progressPercentage: number;
  onUpdateTarget: (target: number) => void;
}

export const GoalProgressCard: React.FC<Props> = ({
  currentGoal,
  totalSaved,
  progressPercentage,
  onUpdateTarget,
}) => {
  const [localTarget, setLocalTarget] = useState('');

  useEffect(() => {
    if (currentGoal) {
      setLocalTarget(currentGoal.target_amount.toString());
    }
  }, [currentGoal]);

  if (!currentGoal) {
    return null; // Don't render anything if no goal is selected
  }

  const remaining = currentGoal.target_amount - totalSaved;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {currentGoal.title} Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium w-24">Goal Target:</label>
          <div className="flex items-center gap-2">
            <span className="text-lg">$</span>
            <Input
              type="number"
              value={localTarget}
              onChange={(e) => setLocalTarget(e.target.value)}
              onBlur={() => onUpdateTarget(parseFloat(localTarget) || 0)}
              className="w-32"
              placeholder="0"
            />
          </div>
        </div>

        {currentGoal.target_amount > 0 && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progressPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${totalSaved.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Total Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">${remaining.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Remaining</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// src/components/GoalProgressCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Target, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [localTarget, setLocalTarget] = useState<string>('');

  // Initialize or update local target input when currentGoal changes
  useEffect(() => {
    if (currentGoal) {
      setLocalTarget(currentGoal.target_amount.toString());
    }
  }, [currentGoal]);

  const handleBlur = () => {
    const value = parseFloat(localTarget) || 0;
    if (value > 0 && value !== currentGoal?.target_amount) {
      onUpdateTarget(value);
    }
  };

  if (!currentGoal) {
    return null;
  }

  const remaining = currentGoal.target_amount - totalSaved;
  const isComplete = progressPercentage >= 100;
  const isNearComplete = progressPercentage >= 75 && progressPercentage < 100;
  const milestones = [25, 50, 75, 100];

  return (
    <Card className="bg-gradient-to-br from-white via-white to-teal/5 backdrop-blur-sm border-2 border-border/50 shadow-[var(--shadow-elegant)] animate-scale-in overflow-hidden relative">
      {isComplete && (
        <div className="absolute inset-0 bg-gradient-to-r from-success/5 via-teal/10 to-success/5 animate-glow pointer-events-none" />
      )}
      <CardHeader className="relative pb-4">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "inline-flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 flex-shrink-0",
              isComplete ? "bg-success/20 animate-pulse" : "bg-teal/20"
            )}>
              <Target className={cn(
                "h-7 w-7",
                isComplete ? "text-success" : "text-teal"
              )} />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-teal bg-clip-text text-transparent">
              {currentGoal.title} Progress
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Label htmlFor="target-input" className="text-sm font-medium">Goal Target:</Label>
          <div className="relative w-full sm:flex-1 sm:max-w-xs">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="target-input"
              type="number"
              value={localTarget}
              onChange={(e) => setLocalTarget(e.target.value)}
              onBlur={handleBlur}
              className="pl-9 h-10 font-semibold bg-white/80 border-2 hover:border-teal/40 focus:border-teal transition-all"
              min="0"
              step="100"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative pt-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
              <span className={cn(
                "text-lg font-bold transition-colors",
                isComplete ? "text-success" : isNearComplete ? "text-teal" : "text-foreground"
              )}>
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
            
            <div className="relative h-6 w-full overflow-hidden rounded-full bg-muted/50 shadow-inner">
              <div 
                className={cn(
                  "h-full transition-all duration-700 ease-out rounded-full relative",
                  isComplete 
                    ? "bg-gradient-to-r from-success via-teal to-success animate-glow shadow-[0_0_20px_rgba(34,197,94,0.4)]" 
                    : isNearComplete
                    ? "bg-gradient-to-r from-teal to-teal-glow shadow-[var(--shadow-teal)]"
                    : "bg-gradient-to-r from-teal/80 to-teal"
                )}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              >
                {isComplete && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                )}
              </div>
              
              {/* Milestone markers - hidden on very small screens to prevent cramping */}
              {milestones.map((milestone) => (
                <div
                  key={milestone}
                  className="absolute top-0 bottom-0 w-0.5 bg-background/40 hidden sm:block"
                  style={{ left: `${milestone}%` }}
                >
                  <div className={cn(
                    "absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap transition-opacity",
                    progressPercentage >= milestone ? "text-teal opacity-100" : "text-muted-foreground opacity-60"
                  )}>
                    {milestone}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border-2 border-border/30 hover:border-teal/40 transition-all hover:shadow-md">
              <div className="text-sm text-muted-foreground mb-2">Total Saved</div>
              <div className="text-2xl font-bold text-teal">
                ${totalSaved.toLocaleString()}
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border-2 border-border/30 hover:border-teal/40 transition-all hover:shadow-md">
              <div className="text-sm text-muted-foreground mb-2">
                {isComplete ? "Exceeded by" : "Remaining"}
              </div>
              <div className={cn(
                "text-2xl font-bold",
                isComplete ? "text-success" : "text-foreground"
              )}>
                ${Math.abs(remaining).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

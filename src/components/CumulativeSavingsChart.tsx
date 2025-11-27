import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';
import { ChevronLeft, ChevronRight, TrendingUp, CheckCircle, Edit2, Check, X, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavingsGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
}

interface EditingState {
  id: string | null;
  title: string;
  target: number;
}

interface CumulativeSavingsChartProps {
  monthlyData: Record<number, number>;
  goals: SavingsGoal[];
  currentGoalId: string | null;
  totalSaved: number;
  progressPercentage: number;
  onSelectGoal: (id: string) => void;
  editingState: EditingState;
  onSetEditingState: (state: EditingState) => void;
  onUpdateGoal: (goalId: string, title: string, target: number) => void;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CumulativeSavingsChart: React.FC<CumulativeSavingsChartProps> = ({
  monthlyData,
  goals,
  currentGoalId,
  totalSaved,
  progressPercentage,
  onSelectGoal,
  editingState,
  onSetEditingState,
  onUpdateGoal,
}) => {
  const currentGoal = goals.find(g => g.id === currentGoalId);
  const currentIndex = goals.findIndex(g => g.id === currentGoalId);
  const isEditing = editingState.id === currentGoalId;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSelectGoal(goals[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < goals.length - 1) {
      onSelectGoal(goals[currentIndex + 1].id);
    }
  };

  const handleSave = () => {
    if (editingState.id && editingState.title.trim()) {
      onUpdateGoal(editingState.id, editingState.title.trim(), editingState.target);
    }
  };

  const startEditing = () => {
    if (currentGoal) {
      onSetEditingState({ id: currentGoal.id, title: currentGoal.title, target: currentGoal.target_amount });
    }
  };

  // Calculate cumulative totals for each month
  const chartData = MONTH_NAMES.map((month, index) => {
    const cumulativeTotal = Object.entries(monthlyData)
      .filter(([monthIdx]) => parseInt(monthIdx) <= index)
      .reduce((sum, [, amount]) => sum + amount, 0);
    
    return {
      month,
      cumulative: cumulativeTotal,
      monthly: monthlyData[index] || 0,
      target: currentGoal?.target_amount || 0,
    };
  });

  const targetAmount = currentGoal?.target_amount || 0;
  const maxValue = Math.max(targetAmount, ...chartData.map(d => d.cumulative), 1);
  const remaining = targetAmount - totalSaved;
  const isComplete = progressPercentage >= 100;
  const isNearComplete = progressPercentage >= 75 && progressPercentage < 100;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-border/50 shadow-[var(--shadow-elegant)] animate-slide-up relative overflow-hidden">
      {isComplete && (
        <div className="absolute inset-0 bg-gradient-to-r from-success/5 via-teal/10 to-success/5 pointer-events-none" />
      )}
      <CardHeader className="pb-2 relative">
        {/* Navigation and Title Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Left Arrow */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex <= 0}
            className="h-10 w-10 shrink-0 disabled:opacity-30"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Center: Title and Edit */}
          <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
            {isEditing ? (
              <div className="flex flex-col gap-2 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <Input
                    value={editingState.title}
                    onChange={(e) => onSetEditingState({ ...editingState, title: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    placeholder="Goal name"
                    className="text-center text-lg font-semibold bg-background text-foreground h-9"
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="relative w-40">
                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={editingState.target || ''}
                      onChange={(e) => onSetEditingState({ ...editingState, target: parseFloat(e.target.value) || 0 })}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      placeholder="Target"
                      className="pl-8 text-center bg-background text-foreground h-9"
                      min="0"
                      step="100"
                    />
                  </div>
                  <Button size="icon" variant="ghost" onClick={handleSave} className="h-8 w-8 p-0 hover:bg-success/20">
                    <Check className="h-4 w-4 text-success" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onSetEditingState({ id: null, title: '', target: 0 })} className="h-8 w-8 p-0 hover:bg-destructive/20">
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={startEditing}>
                <div className={cn(
                  "inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all shrink-0",
                  isComplete ? "bg-success/20" : "bg-gradient-to-br from-teal/20 to-teal-glow/20"
                )}>
                  {isComplete ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-teal" />
                  )}
                </div>
                <h2 className="text-xl font-bold text-foreground truncate">
                  {currentGoal?.title || 'No Goal Selected'}
                </h2>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 shrink-0"
                  onClick={(e) => { e.stopPropagation(); startEditing(); }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {/* Goal indicator dots */}
            {!isEditing && (
              <div className="flex items-center gap-1.5 mt-1">
                {goals.map((goal, index) => (
                  <button
                    key={goal.id}
                    onClick={() => onSelectGoal(goal.id)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentIndex 
                        ? "bg-primary w-4" 
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Arrow */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex >= goals.length - 1}
            className="h-10 w-10 shrink-0 disabled:opacity-30"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Stats row */}
        {!isEditing && (
          <>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-border/30 text-center">
                <div className="text-xs text-muted-foreground mb-1">Target</div>
                <div className="text-lg font-bold text-foreground">
                  ${targetAmount.toLocaleString()}
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-border/30 text-center">
                <div className="text-xs text-muted-foreground mb-1">Saved</div>
                <div className="text-lg font-bold text-teal">
                  ${totalSaved.toLocaleString()}
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-border/30 text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {isComplete ? "Exceeded" : "Remaining"}
                </div>
                <div className={cn(
                  "text-lg font-bold",
                  isComplete ? "text-success" : "text-foreground"
                )}>
                  ${Math.abs(remaining).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between mb-1 text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className={cn(
                  "font-semibold",
                  isComplete ? "text-success" : isNearComplete ? "text-teal" : "text-muted-foreground"
                )}>
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/50 shadow-inner">
                <div 
                  className={cn(
                    "h-full transition-all duration-700 ease-out rounded-full relative",
                    isComplete 
                      ? "bg-gradient-to-r from-success via-teal to-success" 
                      : isNearComplete
                      ? "bg-gradient-to-r from-teal to-teal-glow"
                      : "bg-gradient-to-r from-teal/80 to-teal"
                  )}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          </>
        )}
      </CardHeader>
      
      <CardContent className="pt-2 relative">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--teal))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--teal))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`}
                domain={[0, maxValue * 1.1]}
                width={45}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-elegant)',
                  fontSize: '12px'
                }}
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name === 'cumulative' ? 'Total Saved' : name === 'target' ? 'Target' : 'This Month'
                ]}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              />
              {/* Target line */}
              {targetAmount > 0 && (
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="hsl(var(--warning))"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                  name="Target"
                />
              )}
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="hsl(var(--teal))"
                strokeWidth={2}
                fill="url(#cumulativeGradient)"
                dot={{ fill: 'hsl(var(--teal))', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, fill: 'hsl(var(--teal))', stroke: 'white', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-teal rounded" />
            <span className="text-muted-foreground">Cumulative</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded" style={{ background: 'repeating-linear-gradient(90deg, hsl(var(--warning)) 0, hsl(var(--warning)) 3px, transparent 3px, transparent 6px)' }} />
            <span className="text-muted-foreground">Target</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

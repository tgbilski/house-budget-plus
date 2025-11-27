import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Target, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CumulativeSavingsChartProps {
  monthlyData: Record<number, number>;
  goalTitle: string;
  targetAmount: number;
  totalSaved: number;
  progressPercentage: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CumulativeSavingsChart: React.FC<CumulativeSavingsChartProps> = ({
  monthlyData,
  goalTitle,
  targetAmount,
  totalSaved,
  progressPercentage,
}) => {
  // Calculate cumulative totals for each month
  const chartData = MONTH_NAMES.map((month, index) => {
    const cumulativeTotal = Object.entries(monthlyData)
      .filter(([monthIdx]) => parseInt(monthIdx) <= index)
      .reduce((sum, [, amount]) => sum + amount, 0);
    
    return {
      month,
      cumulative: cumulativeTotal,
      monthly: monthlyData[index] || 0,
      target: targetAmount,
    };
  });

  const maxValue = Math.max(targetAmount, ...chartData.map(d => d.cumulative), 1);
  const remaining = targetAmount - totalSaved;
  const isComplete = progressPercentage >= 100;
  const isNearComplete = progressPercentage >= 75 && progressPercentage < 100;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-border/50 shadow-[var(--shadow-elegant)] animate-slide-up h-full relative overflow-hidden">
      {isComplete && (
        <div className="absolute inset-0 bg-gradient-to-r from-success/5 via-teal/10 to-success/5 pointer-events-none" />
      )}
      <CardHeader className="pb-2 relative">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all",
              isComplete ? "bg-success/20" : "bg-gradient-to-br from-teal/20 to-teal-glow/20"
            )}>
              {isComplete ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <TrendingUp className="h-5 w-5 text-teal" />
              )}
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                {goalTitle}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Cumulative Progress
              </p>
            </div>
          </div>
          
          {/* Progress badge */}
          <div className={cn(
            "px-3 py-1.5 rounded-full text-sm font-bold",
            isComplete ? "bg-success/20 text-success" : isNearComplete ? "bg-teal/20 text-teal" : "bg-muted text-muted-foreground"
          )}>
            {progressPercentage.toFixed(0)}%
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-border/30">
            <div className="text-xs text-muted-foreground mb-1">Total Saved</div>
            <div className="text-xl font-bold text-teal">
              ${totalSaved.toLocaleString()}
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-border/30">
            <div className="text-xs text-muted-foreground mb-1">
              {isComplete ? "Exceeded by" : "Remaining"}
            </div>
            <div className={cn(
              "text-xl font-bold",
              isComplete ? "text-success" : "text-foreground"
            )}>
              ${Math.abs(remaining).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
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
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>$0</span>
            <span>${targetAmount.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2 relative">
        <div className="h-[180px] w-full">
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

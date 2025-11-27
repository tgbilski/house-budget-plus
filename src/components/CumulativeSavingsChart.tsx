import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface CumulativeSavingsChartProps {
  monthlyData: Record<number, number>;
  goalTitle: string;
  targetAmount: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CumulativeSavingsChart: React.FC<CumulativeSavingsChartProps> = ({
  monthlyData,
  goalTitle,
  targetAmount,
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
    };
  });

  const maxValue = Math.max(targetAmount, ...chartData.map(d => d.cumulative));
  const currentTotal = chartData[chartData.length - 1]?.cumulative || 0;
  const progressPercent = targetAmount > 0 ? Math.min((currentTotal / targetAmount) * 100, 100) : 0;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-border/50 shadow-[var(--shadow-elegant)] animate-slide-up h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-teal/20 to-teal-glow/20 rounded-lg">
            <TrendingUp className="h-4 w-4 text-teal" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Cumulative Savings
            </CardTitle>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {goalTitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="text-2xl font-bold text-teal">
            ${currentTotal.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            of ${targetAmount.toLocaleString()} ({progressPercent.toFixed(0)}%)
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--teal))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--teal))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                domain={[0, maxValue * 1.1]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-elegant)'
                }}
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name === 'cumulative' ? 'Total Saved' : 'This Month'
                ]}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              />
              {/* Target line */}
              {targetAmount > 0 && (
                <Line
                  type="monotone"
                  dataKey={() => targetAmount}
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
                strokeWidth={3}
                fill="url(#cumulativeGradient)"
                dot={{ fill: 'hsl(var(--teal))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--teal))', stroke: 'white', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-teal rounded" />
            <span className="text-muted-foreground">Cumulative Total</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-warning rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, hsl(var(--warning)) 0, hsl(var(--warning)) 4px, transparent 4px, transparent 8px)' }} />
            <span className="text-muted-foreground">Target Goal</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

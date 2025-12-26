import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface BudgetDonutChartProps {
  totalIncome: number;
  totalExpenses: number;
  currency: Currency;
}

export const BudgetDonutChart = ({ totalIncome, totalExpenses, currency }: BudgetDonutChartProps) => {
  const netBalance = totalIncome - totalExpenses;
  const hasData = totalIncome > 0 || totalExpenses > 0;

  const data = [
    { name: 'Income', value: totalIncome, color: '#10b981' }, // green-500
    { name: 'Expenses', value: totalExpenses, color: '#ef4444' }, // red-500
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-lg font-bold" style={{ color: payload[0].payload.color }}>
            {currency.symbol}{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-card rounded-xl p-4 border-[3px] border-stroke shadow-cartoon overflow-hidden">
      <h3 className="text-lg font-bold text-center mb-3 text-card-foreground">Budget Overview</h3>
      {hasData ? (
        <div className="flex flex-col gap-4 items-center">
          {/* Donut Chart */}
          <div className="flex-shrink-0">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                  label={renderCustomLabel}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between p-2 bg-green-500/10 rounded">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
                <span className="text-sm font-medium text-muted-foreground">Income</span>
              </div>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {currency.symbol}{totalIncome.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 bg-red-500/10 rounded">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
                <span className="text-sm font-medium text-muted-foreground">Expenses</span>
              </div>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                {currency.symbol}{totalExpenses.toLocaleString()}
              </span>
            </div>

            {/* Net Balance */}
            <div className="flex items-center justify-between p-2 border-t border-border pt-3">
              <div className="flex items-center gap-2">
                {netBalance > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : netBalance < 0 ? (
                  <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                ) : (
                  <Minus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className="text-sm font-bold text-foreground">Net Balance</span>
              </div>
              <span className={`text-base font-bold ${
                netBalance > 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : netBalance < 0 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-muted-foreground'
              }`}>
                {currency.symbol}{Math.abs(netBalance).toLocaleString()}
              </span>
            </div>

            {netBalance < 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2">
                <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
                  ⚠️ Expenses exceed income by {currency.symbol}{Math.abs(netBalance).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm font-medium mb-1">No data yet</p>
          <p className="text-xs">Add income and expenses to see your budget</p>
        </div>
      )}
    </div>
  );
};

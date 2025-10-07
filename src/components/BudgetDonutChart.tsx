import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const renderCustomLabel = (entry: any) => {
    const percentage = ((entry.value / (totalIncome + totalExpenses)) * 100).toFixed(1);
    return `${percentage}%`;
  };

  return (
    <Card className="bg-white shadow-xl border-2 border-gray-100">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-center">Budget Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
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

            {/* Legend */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="font-semibold text-gray-700">Total Income</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {currency.symbol}{totalIncome.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="font-semibold text-gray-700">Total Expenses</span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {currency.symbol}{totalExpenses.toLocaleString()}
                </span>
              </div>

              {/* Net Balance */}
              <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                netBalance > 0 
                  ? 'bg-green-50 border-green-200' 
                  : netBalance < 0 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  {netBalance > 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : netBalance < 0 ? (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  ) : (
                    <Minus className="w-5 h-5 text-gray-600" />
                  )}
                  <span className="font-bold text-gray-900">Net Balance</span>
                </div>
                <span className={`text-xl font-bold ${
                  netBalance > 0 
                    ? 'text-green-600' 
                    : netBalance < 0 
                    ? 'text-red-600' 
                    : 'text-gray-600'
                }`}>
                  {currency.symbol}{Math.abs(netBalance).toLocaleString()}
                </span>
              </div>

              {netBalance < 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-amber-800 text-center">
                    ⚠️ Your expenses exceed your income by {currency.symbol}{Math.abs(netBalance).toLocaleString()}
                  </p>
                </div>
              )}
              
              {netBalance > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-green-800 text-center">
                    ✅ Great job! You have {currency.symbol}{netBalance.toLocaleString()} left to save or invest
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium mb-2">No budget data yet</p>
            <p className="text-sm">Add your income and expenses to see your budget visualization</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

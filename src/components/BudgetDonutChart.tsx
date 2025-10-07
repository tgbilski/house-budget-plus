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

  const renderCustomLabel = (entry: any) => {
    const percentage = ((entry.value / (totalIncome + totalExpenses)) * 100).toFixed(1);
    return `${percentage}%`;
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
      <h3 className="text-lg font-bold text-center mb-3">Budget Overview</h3>
      {hasData ? (
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Left side - Donut Chart */}
          <div className="flex-shrink-0">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Right side - Stats */}
          <div className="flex-1 space-y-2 w-full">
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-gray-700">Income</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                {currency.symbol}{totalIncome.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 bg-red-50 rounded">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium text-gray-700">Expenses</span>
              </div>
              <span className="text-sm font-bold text-red-600">
                {currency.symbol}{totalExpenses.toLocaleString()}
              </span>
            </div>

            {/* Net Balance */}
            <div className={`flex items-center justify-between p-2 rounded border ${
              netBalance > 0 
                ? 'bg-green-50 border-green-200' 
                : netBalance < 0 
                ? 'bg-red-50 border-red-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                {netBalance > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : netBalance < 0 ? (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                ) : (
                  <Minus className="w-4 h-4 text-gray-600" />
                )}
                <span className="text-sm font-bold text-gray-900">Net Balance</span>
              </div>
              <span className={`text-base font-bold ${
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
              <div className="bg-amber-50 border border-amber-200 rounded p-2 mt-1">
                <p className="text-xs text-amber-800 text-center">
                  ⚠️ Expenses exceed income by {currency.symbol}{Math.abs(netBalance).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm font-medium mb-1">No data yet</p>
          <p className="text-xs">Add income and expenses to see your budget</p>
        </div>
      )}
    </div>
  );
};

// src/components/ProjectSummaryCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp, FileText, BadgePercent } from 'lucide-react';

interface Props {
  stats: {
    quoteCount: number;
    lowestQuote: number;
    highestQuote: number;
    savingsPotential: number;
  };
  currencySymbol: string;
}

const StatBox: React.FC<{ icon: React.ElementType; title: string; value: string; color: string }> = ({ icon: Icon, title, value, color }) => (
  <div className="flex items-start gap-4">
    <div className={`p-2 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
      <Icon className={`h-6 w-6 ${color}`} />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);


export const ProjectSummaryCard: React.FC<Props> = ({ stats, currencySymbol }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox icon={FileText} title="Quotes Received" value={`${stats.quoteCount}`} color="text-blue-500" />
        <StatBox icon={TrendingDown} title="Lowest Quote" value={`${currencySymbol}${stats.lowestQuote.toLocaleString()}`} color="text-green-500" />
        <StatBox icon={TrendingUp} title="Highest Quote" value={`${currencySymbol}${stats.highestQuote.toLocaleString()}`} color="text-red-500" />
        <StatBox icon={BadgePercent} title="Savings Potential" value={`${currencySymbol}${stats.savingsPotential.toLocaleString()}`} color="text-indigo-500" />
      </CardContent>
    </Card>
  );
};

import React from 'react';
import { Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useYear } from '@/hooks/useYear';

interface YearSelectorProps {
  className?: string;
}

export const YearSelector: React.FC<YearSelectorProps> = ({ className = '' }) => {
  const { selectedYear, setSelectedYear, availableYears } = useYear();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Calendar className="h-6 w-6 text-muted-foreground" />
      <Select 
        value={selectedYear.toString()} 
        onValueChange={(value) => setSelectedYear(parseInt(value))}
      >
        <SelectTrigger className="w-32 h-12 text-lg font-bold border-2 hover:border-primary/50 transition-colors bg-card">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className="z-50 bg-background border-2 shadow-lg">
          {availableYears.map((year) => (
            <SelectItem 
              key={year} 
              value={year.toString()}
              className="text-lg font-medium hover:bg-primary/10 focus:bg-primary/10"
            >
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
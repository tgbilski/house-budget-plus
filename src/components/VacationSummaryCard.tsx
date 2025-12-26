// src/components/VacationSummaryCard.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Edit2, Check, X, Plane, 
  Calendar as CalendarIcon, TrendingUp, DollarSign 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VacationProject, VacationOption } from '@/hooks/useVacationPlanner';

interface Props {
  vacations: VacationProject[];
  currentVacationId: string | null;
  options: VacationOption[];
  currencySymbol: string;
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date?: Date) => void;
  onEndDateChange: (date?: Date) => void;
  onSelectVacation: (id: string) => void;
  onUpdateTitle: (vacationId: string, newTitle: string) => void;
}

const StatBox: React.FC<{ icon: React.ElementType; title: string; value: string; colorClass: string }> = ({ 
  icon: Icon, title, value, colorClass 
}) => (
  <div className={cn("flex items-center gap-3 min-w-0 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-border/30", colorClass)}>
    <div className={cn("p-2 rounded-lg shrink-0", colorClass.replace('border-', 'bg-').replace('/30', '/20'))}>
      <Icon className={cn("h-4 w-4", colorClass.replace('border-', 'text-').replace('/30', ''))} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-muted-foreground truncate">{title}</p>
      <p className="text-base sm:text-lg font-bold truncate">{value}</p>
    </div>
  </div>
);

export const VacationSummaryCard: React.FC<Props> = ({ 
  vacations, 
  currentVacationId, 
  options,
  currencySymbol,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSelectVacation,
  onUpdateTitle 
}) => {
  const [editingState, setEditingState] = useState({ id: '', title: '' });
  
  const currentVacation = vacations.find(v => v.id === currentVacationId);
  const currentIndex = vacations.findIndex(v => v.id === currentVacationId);
  const isEditing = editingState.id === currentVacationId;

  // Calculate budget stats
  const calculateTotal = (option: VacationOption) => {
    return (option.travel_mode_cost || 0) + (option.lodging_cost || 0) + (option.car_rental_cost || 0);
  };
  const totals = options.map(calculateTotal);
  const lowestCost = totals.length > 0 ? Math.min(...totals) : 0;
  const highestCost = totals.length > 0 ? Math.max(...totals) : 0;
  const averageCost = totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSelectVacation(vacations[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < vacations.length - 1) {
      onSelectVacation(vacations[currentIndex + 1].id);
    }
  };

  const handleSave = () => {
    if (editingState.id && editingState.title.trim()) {
      onUpdateTitle(editingState.id, editingState.title.trim());
    }
    setEditingState({ id: '', title: '' });
  };

  const startEditing = () => {
    if (currentVacation) {
      setEditingState({ id: currentVacation.id, title: currentVacation.title });
    }
  };

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        {/* Navigation and Title Row */}
        <div className="flex flex-col gap-2">
          {/* Edit mode - full width form */}
          {isEditing ? (
            <div className="flex flex-col items-center gap-3 w-full py-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={editingState.title}
                onChange={(e) => setEditingState({ ...editingState, title: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Trip name"
                className="text-center text-base sm:text-lg font-semibold bg-background text-foreground h-12 w-full max-w-md"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" variant="default" onClick={handleSave} className="h-9 px-6 gap-1">
                  <Check className="h-4 w-4" /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingState({ id: '', title: '' })} className="h-9 px-6">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* View mode - arrows with title */
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

              {/* Center: Title */}
              <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={startEditing}>
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-teal/20 to-teal-glow/20 rounded-lg shrink-0">
                    <Plane className="h-4 w-4 text-teal" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground truncate">
                    {currentVacation?.title || 'No Trip Selected'}
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
                
                {/* Vacation indicator dots */}
                <div className="flex items-center gap-1.5 mt-1">
                  {vacations.map((vacation, index) => (
                    <button
                      key={vacation.id}
                      onClick={() => onSelectVacation(vacation.id)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        index === currentIndex 
                          ? "bg-primary w-4" 
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Right Arrow */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={currentIndex >= vacations.length - 1}
                className="h-10 w-10 shrink-0 disabled:opacity-30"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          )}
        </div>

        {/* Trip Dates */}
        {!isEditing && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full sm:w-[160px] justify-start text-left font-normal h-9 text-sm',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'MMM d, yyyy') : 'Start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar mode="single" selected={startDate} onSelect={onStartDateChange} initialFocus />
              </PopoverContent>
            </Popover>
            
            <span className="text-muted-foreground text-sm">to</span>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full sm:w-[160px] justify-start text-left font-normal h-9 text-sm',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'MMM d, yyyy') : 'End date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar 
                  mode="single" 
                  selected={endDate} 
                  onSelect={onEndDateChange} 
                  disabled={(date) => startDate ? date < startDate : false}
                  initialFocus 
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <StatBox 
          icon={TrendingUp} 
          title="Lowest Option" 
          value={`${currencySymbol}${lowestCost.toLocaleString()}`} 
          colorClass="border-success/30" 
        />
        <StatBox 
          icon={DollarSign} 
          title="Average Cost" 
          value={`${currencySymbol}${averageCost.toLocaleString()}`} 
          colorClass="border-primary/30" 
        />
        <StatBox 
          icon={TrendingUp} 
          title="Highest Option" 
          value={`${currencySymbol}${highestCost.toLocaleString()}`} 
          colorClass="border-warning/30" 
        />
      </CardContent>
    </Card>
  );
};

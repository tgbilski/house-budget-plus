// src/components/VacationSelector.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VacationOption } from '@/hooks/useVacationPlanner';

interface Props {
  options: VacationOption[];
  currentOptionId: string | null;
  onSelectOption: (id: string) => void;
  editingState: { id: string | null; title: string };
  onSetEditingState: (state: { id: string | null; title: string }) => void;
  onUpdateTitle: (optionId: string, newTitle: string) => void;
}

export const VacationSelector: React.FC<Props> = ({ options, currentOptionId, onSelectOption, editingState, onSetEditingState, onUpdateTitle }) => {
  const handleSave = () => {
    if (editingState.id && editingState.title.trim()) {
      onUpdateTitle(editingState.id, editingState.title.trim());
    }
  };

  const getTotalCost = (option: VacationOption) => {
    return (option.travel_mode_cost || 0) + (option.lodging_cost || 0) + (option.car_rental_cost || 0);
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-2">
          {options.map((option) => (
            <div
              key={option.id}
              onClick={() => onSelectOption(option.id)}
              className={cn("group flex-1 cursor-pointer transition-all rounded-lg px-4 py-3 border-2 flex items-center justify-between",
                currentOptionId === option.id ? "bg-primary text-primary-foreground border-primary" : "bg-muted hover:bg-muted/80 border-transparent"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {editingState.id === option.id ? (
                   <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                     <Input value={editingState.title} onChange={(e) => onSetEditingState({ ...editingState, title: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="text-lg font-semibold bg-background text-foreground h-8" autoFocus />
                     <Button size="icon" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0 shrink-0"><Check className="h-4 w-4" /></Button>
                     <Button size="icon" variant="ghost" onClick={() => onSetEditingState({ id: null, title: ''})} className="h-6 w-6 p-0 shrink-0"><X className="h-4 w-4" /></Button>
                   </div>
                ) : (
                  <>
                    <span className="text-lg font-semibold truncate">{option.destination || `Option ${option.vacation_number}`}</span>
                    <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onSetEditingState({ id: option.id, title: option.destination }); }} className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"><Edit2 className="h-3 w-3" /></Button>
                  </>
                )}
              </div>
              <span className="text-sm opacity-75">${getTotalCost(option).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

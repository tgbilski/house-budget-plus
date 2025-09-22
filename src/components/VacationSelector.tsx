// src/components/VacationSelector.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VacationProject } from '@/hooks/useVacationPlanner';

interface Props {
  vacations: VacationProject[];
  currentVacationId: string | null;
  onSelectVacation: (id: string) => void;
  editingState: { id: string | null; title: string };
  onSetEditingState: (state: { id: string | null; title: string }) => void;
  onUpdateTitle: (vacationId: string, newTitle: string) => void;
}

export const VacationSelector: React.FC<Props> = ({ vacations, currentVacationId, onSelectVacation, editingState, onSetEditingState, onUpdateTitle }) => {
  const handleSave = () => {
    if (editingState.id && editingState.title.trim()) {
      onUpdateTitle(editingState.id, editingState.title.trim());
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-2">
          {vacations.map((vacation) => (
            <div
              key={vacation.id}
              onClick={() => onSelectVacation(vacation.id)}
              className={cn("group flex-1 cursor-pointer transition-all rounded-lg px-4 py-3 border-2 flex items-center justify-center gap-2",
                currentVacationId === vacation.id ? "bg-primary text-primary-foreground border-primary" : "bg-muted hover:bg-muted/80 border-transparent"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {editingState.id === vacation.id ? (
                   <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                     <Input value={editingState.title} onChange={(e) => onSetEditingState({ ...editingState, title: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="text-lg font-semibold bg-background text-foreground h-8" autoFocus />
                     <Button size="icon" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0 shrink-0"><Check className="h-4 w-4" /></Button>
                     <Button size="icon" variant="ghost" onClick={() => onSetEditingState({ id: null, title: ''})} className="h-6 w-6 p-0 shrink-0"><X className="h-4 w-4" /></Button>
                   </div>
                ) : (
                  <>
                    <span className="text-lg font-semibold truncate">{vacation.title}</span>
                    <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onSetEditingState({ id: vacation.id, title: vacation.title }); }} className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"><Edit2 className="h-3 w-3" /></Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

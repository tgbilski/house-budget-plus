// src/components/GoalSelector.tsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit2, Check, X, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavingsGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
}

interface EditingState {
  id: string | null;
  title: string;
  target: number;
}

interface Props {
  goals: SavingsGoal[];
  currentGoalId: string | null;
  onSelectGoal: (id: string) => void;
  editingState: EditingState;
  onSetEditingState: (state: EditingState) => void;
  onUpdateGoal: (goalId: string, title: string, target: number) => void;
}

export const GoalSelector: React.FC<Props> = ({
  goals,
  currentGoalId,
  onSelectGoal,
  editingState,
  onSetEditingState,
  onUpdateGoal,
}) => {
  const handleSave = () => {
    if (editingState.id && editingState.title.trim()) {
      onUpdateGoal(editingState.id, editingState.title.trim(), editingState.target);
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-2">
          {goals.map((goal) => {
            const isActive = currentGoalId === goal.id;
            const isEditing = editingState.id === goal.id;

            return (
              <div
                key={goal.id}
                onClick={() => !isEditing && onSelectGoal(goal.id)}
                className={cn(
                  "group flex-1 cursor-pointer transition-all rounded-lg px-4 py-3 border-2 flex items-center justify-center gap-2",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted hover:bg-muted/80 border-transparent"
                )}
              >
                {isEditing ? (
                  <div className="flex flex-col gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingState.title}
                        onChange={(e) => onSetEditingState({ ...editingState, title: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        placeholder="Goal name"
                        className="text-base font-semibold bg-background text-foreground h-8 flex-1"
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <Input
                          type="number"
                          value={editingState.target || ''}
                          onChange={(e) => onSetEditingState({ ...editingState, target: parseFloat(e.target.value) || 0 })}
                          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                          placeholder="Target"
                          className="pl-7 text-sm bg-background text-foreground h-8"
                          min="0"
                          step="100"
                        />
                      </div>
                      <Button size="icon" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0 shrink-0 hover:bg-success/20">
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onSetEditingState({ id: null, title: '', target: 0 })} className="h-6 w-6 p-0 shrink-0 hover:bg-destructive/20">
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-lg font-semibold">{goal.title}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onSetEditingState({ id: goal.id, title: goal.title, target: goal.target_amount }); 
                      }} 
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

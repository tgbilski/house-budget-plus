// src/components/GoalSelector.tsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavingsGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
}

interface Props {
  goals: SavingsGoal[];
  currentGoalId: string | null;
  onSelectGoal: (id: string) => void;
  editingState: { id: string | null; title: string };
  onSetEditingState: (state: { id: string | null; title: string }) => void;
  onUpdateTitle: (goalId: string, newTitle: string) => void;
}

export const GoalSelector: React.FC<Props> = ({
  goals,
  currentGoalId,
  onSelectGoal,
  editingState,
  onSetEditingState,
  onUpdateTitle,
}) => {
  const handleSave = () => {
    if (editingState.id && editingState.title.trim()) {
      onUpdateTitle(editingState.id, editingState.title.trim());
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={cn(
              "group relative cursor-pointer transition-all w-full rounded-lg px-4 py-3 border-2 flex items-center justify-between min-w-0",
              currentGoalId === goal.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted hover:bg-muted/80 border-transparent hover:border-muted-foreground/20"
            )}
            onClick={() => onSelectGoal(goal.id)}
          >
            <div className="flex items-center gap-2 min-w-0">
              {editingState.id === goal.id ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={editingState.title}
                    onChange={(e) => onSetEditingState({ ...editingState, title: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    className="text-lg font-semibold bg-background text-foreground h-8"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onSetEditingState({ id: null, title: '' })} className="h-6 w-6 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-lg font-semibold truncate">{goal.title}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetEditingState({ id: goal.id, title: goal.title });
                    }}
                    className="h-6 w-6 p-0 opacity-60 group-hover:opacity-100"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
            <div className="text-sm opacity-75 flex-shrink-0 ml-2">
              ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

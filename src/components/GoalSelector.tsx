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
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-border/50 shadow-[var(--shadow-elegant)] animate-slide-up">
      <CardContent className="p-4 space-y-3">
        {goals.map((goal, index) => {
          const isActive = currentGoalId === goal.id;
          const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
          
          return (
            <div
              key={goal.id}
              className={cn(
                "group relative cursor-pointer transition-all duration-300 w-full rounded-xl px-5 py-4 border-2 flex items-center justify-between min-w-0 animate-fade-in",
                isActive
                  ? "bg-gradient-to-r from-teal to-teal-glow text-white border-teal shadow-[var(--shadow-teal)] scale-[1.02]"
                  : "bg-white/60 backdrop-blur-sm hover:bg-white/80 border-border/30 hover:border-teal/40 hover:shadow-md hover:-translate-y-0.5"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onSelectGoal(goal.id)}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {editingState.id === goal.id ? (
                  <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={editingState.title}
                      onChange={(e) => onSetEditingState({ ...editingState, title: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      className="text-lg font-semibold bg-background text-foreground h-9 flex-1"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" onClick={handleSave} className="h-8 w-8 p-0 hover:bg-success/20">
                      <Check className="h-4 w-4 text-success" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onSetEditingState({ id: null, title: '' })} className="h-8 w-8 p-0 hover:bg-destructive/20">
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-lg font-semibold truncate", isActive ? "text-white" : "text-foreground")}>
                          {goal.title}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetEditingState({ id: goal.id, title: goal.title });
                          }}
                          className={cn(
                            "h-7 w-7 p-0 transition-all duration-200",
                            isActive ? "opacity-70 hover:opacity-100 text-white" : "opacity-0 group-hover:opacity-100"
                          )}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      {!isActive && progress > 0 && (
                        <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-teal to-teal-glow transition-all duration-500 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className={cn(
                "text-sm font-medium flex-shrink-0 ml-3 px-3 py-1 rounded-full",
                isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              )}>
                ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

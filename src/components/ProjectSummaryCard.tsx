// src/components/ProjectSummaryCard.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrendingDown, TrendingUp, FileText, BadgePercent, ChevronLeft, ChevronRight, Edit2, Check, X, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { VendorProject } from '@/hooks/useVendorProjects';

interface Props {
  projects: VendorProject[];
  currentProjectId: string | null;
  stats: {
    quoteCount: number;
    lowestQuote: number;
    highestQuote: number;
    savingsPotential: number;
  };
  currencySymbol: string;
  onSelectProject: (id: string) => void;
  onUpdateTitle: (projectId: string, newTitle: string) => void;
}

const StatBox: React.FC<{ icon: React.ElementType; title: string; value: string; color: string }> = ({ icon: Icon, title, value, color }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 min-w-0 bg-white/60 backdrop-blur-sm rounded-xl p-2 sm:p-3 border border-border/30 cursor-default text-center sm:text-left">
          <div className={`p-1.5 sm:p-2 rounded-lg bg-opacity-10 flex-shrink-0 ${color.replace('text-', 'bg-')}`}>
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
          </div>
          <div className="min-w-0 flex-1 w-full">
            <p className="text-[9px] xs:text-[10px] sm:text-xs text-muted-foreground leading-tight whitespace-normal">{title}</p>
            <p className="text-sm sm:text-lg font-bold truncate">{value}</p>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{title}</p>
        <p className="text-lg font-bold">{value}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const ProjectSummaryCard: React.FC<Props> = ({ 
  projects, 
  currentProjectId, 
  stats, 
  currencySymbol,
  onSelectProject,
  onUpdateTitle 
}) => {
  const [editingState, setEditingState] = useState({ id: '', title: '' });
  
  const currentProject = projects.find(p => p.id === currentProjectId);
  const currentIndex = projects.findIndex(p => p.id === currentProjectId);
  const isEditing = editingState.id === currentProjectId;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSelectProject(projects[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < projects.length - 1) {
      onSelectProject(projects[currentIndex + 1].id);
    }
  };

  const handleSave = () => {
    if (editingState.id && editingState.title.trim()) {
      onUpdateTitle(editingState.id, editingState.title.trim());
    }
    setEditingState({ id: '', title: '' });
  };

  const startEditing = () => {
    if (currentProject) {
      setEditingState({ id: currentProject.id, title: currentProject.title });
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-border/50 shadow-[var(--shadow-elegant)]">
      <CardHeader className="pb-2">
        {/* Navigation and Title Row */}
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

          {/* Center: Title and Edit */}
          <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={editingState.title}
                  onChange={(e) => setEditingState({ ...editingState, title: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="Project name"
                  className="text-center text-lg font-semibold bg-background text-foreground h-9"
                  autoFocus
                />
                <Button size="icon" variant="ghost" onClick={handleSave} className="h-8 w-8 p-0 hover:bg-success/20 shrink-0">
                  <Check className="h-4 w-4 text-success" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setEditingState({ id: '', title: '' })} className="h-8 w-8 p-0 hover:bg-destructive/20 shrink-0">
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={startEditing}>
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-teal/20 to-teal-glow/20 rounded-lg shrink-0">
                  <Scale className="h-4 w-4 text-teal" />
                </div>
                <h2 className="text-xl font-bold text-foreground truncate">
                  {currentProject?.title || 'No Project Selected'}
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
            )}
            
            {/* Project indicator dots */}
            {!isEditing && (
              <div className="flex items-center gap-1.5 mt-1">
                {projects.map((project, index) => (
                  <button
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentIndex 
                        ? "bg-primary w-4" 
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Arrow */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex >= projects.length - 1}
            className="h-10 w-10 shrink-0 disabled:opacity-30"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 pt-2">
        <StatBox icon={FileText} title="Quotes" value={`${stats.quoteCount}`} color="text-blue-500" />
        <StatBox icon={TrendingDown} title="Lowest" value={`${currencySymbol}${stats.lowestQuote.toLocaleString()}`} color="text-green-500" />
        <StatBox icon={TrendingUp} title="Highest" value={`${currencySymbol}${stats.highestQuote.toLocaleString()}`} color="text-red-500" />
        <StatBox icon={BadgePercent} title="Savings" value={`${currencySymbol}${stats.savingsPotential.toLocaleString()}`} color="text-indigo-500" />
      </CardContent>
    </Card>
  );
};

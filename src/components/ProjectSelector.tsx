// src/components/ProjectSelector.tsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VendorProject } from '@/hooks/useVendorProjects';

interface Props {
  projects: VendorProject[];
  currentProjectId: string | null;
  onSelectProject: (id: string) => void;
  onUpdateTitle: (projectId: string, newTitle: string) => void;
}

export const ProjectSelector: React.FC<Props> = ({ projects, currentProjectId, onSelectProject, onUpdateTitle }) => {
  const [editingState, setEditingState] = useState({ id: '', title: '' });

  const handleSave = () => {
    if (editingState.id && editingState.title.trim()) {
      onUpdateTitle(editingState.id, editingState.title.trim());
    }
    setEditingState({ id: '', title: '' });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-2">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className={cn(
                "group flex-1 cursor-pointer transition-all rounded-lg px-4 py-3 border-2 flex items-center justify-center gap-2",
                currentProjectId === project.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted hover:bg-muted/80 border-transparent"
              )}
            >
              {editingState.id === project.id ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={editingState.title}
                    onChange={(e) => setEditingState({ ...editingState, title: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    className="text-lg font-semibold bg-background text-foreground h-8"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0 shrink-0"><Check className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingState({ id: '', title: ''})} className="h-6 w-6 p-0 shrink-0"><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <>
                  <span className="text-lg font-semibold">{project.title}</span>
                  <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingState({ id: project.id, title: project.title }); }} className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"><Edit2 className="h-3 w-3" /></Button>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

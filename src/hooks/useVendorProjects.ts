// src/hooks/useVendorProjects.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VendorProject { /* ... interface contents ... */ }
export interface VendorQuote { /* ... interface contents ... */ }

interface UseVendorProjectsProps {
  user: { id: string } | null;
  year: number;
}

export function useVendorProjects({ user, year }: UseVendorProjectsProps) {
  const [projects, setProjects] = useState<VendorProject[]>([]);
  const [quotes, setQuotes] = useState<VendorQuote[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'amount' | 'rating' | 'date'>('amount');

  const loadProjects = useCallback(async () => {
    setIsLoading(true);

    let baseProjects: VendorProject[] = Array.from({ length: 3 }, (_, i) => ({
      id: `temp-${i + 1}-${Date.now()}`, user_id: user?.id || 'guest', year, title: `Project ${i + 1}`, project_number: i + 1
    }));

    if (user) {
      try {
        const { data: dbProjects, error } = await supabase.from('vendor_projects').select('*').eq('user_id', user.id).eq('year', year);
        if (error) throw error;

        if (dbProjects && dbProjects.length > 0) {
          dbProjects.forEach(dbProject => {
            const index = baseProjects.findIndex(p => p.project_number === dbProject.project_number);
            if (index !== -1) {
              baseProjects[index] = dbProject;
            }
          });
        }
      } catch (error) {
        console.error("Error loading projects:", error);
        toast.error("Failed to load projects.");
      }
    }
    
    setProjects(baseProjects);
    if (baseProjects.length > 0) {
      setCurrentProjectId(currentProjectId => 
        baseProjects.some(p => p.id === currentProjectId) ? currentProjectId : baseProjects[0].id
      );
    }
    setIsLoading(false);
  }, [user, year]);

  const loadQuotes = useCallback(async () => { /* ... unchanged ... */ }, [currentProjectId, user]);
  
  // ... all other functions (updateQuote, removeQuote, etc.) remain unchanged ...
  
  useEffect(() => { loadProjects(); }, [loadProjects]);
  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  // ... rest of the hook is unchanged ...

  const updateQuote = async (updatedQuote: VendorQuote) => {
    setQuotes(prev => prev.map(q => q.id === updatedQuote.id ? updatedQuote : q));
    if (!user) return;
    const { id, ...quoteData } = updatedQuote;
    try {
      if (id.startsWith('temp-') || id.startsWith('demo-')) {
        const { data: newRecord, error } = await supabase.from('vendor_quotes').insert(quoteData).select().single();
        if (error) throw error;
        setQuotes(prev => prev.map(q => q.id === id ? newRecord : q));
      } else {
        const { error } = await supabase.from('vendor_quotes').update(quoteData).eq('id', id);
        if (error) throw error;
      }
    } catch(error) {
      toast.error("Failed to save quote.");
      loadQuotes();
    }
  };

  // ... rest of the hook is unchanged ...
}

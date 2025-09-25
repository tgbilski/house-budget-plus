// src/hooks/useVendorProjects.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VendorProject {
  id: string;
  user_id: string;
  title: string;
  project_number: number;
  year: number;
}

export interface VendorQuote {
  id: string;
  project_id: string;
  vendor_name: string;
  estimate_amount: number;
  contact_info: string;
  notes: string;
  liked_sales_rep: boolean;
  offers_financing: boolean;
  good_timing: boolean;
  trustworthy: boolean;
  responsive: boolean;
  date_received: string;
}

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
            if (index !== -1) { baseProjects[index] = dbProject; }
          });
        }
      } catch (error) {
        toast.error("Failed to load projects.");
      }
    }
    
    setProjects(baseProjects);
    if (baseProjects.length > 0) {
      setCurrentProjectId(currentId => baseProjects.some(p => p.id === currentId) ? currentId : baseProjects[0].id);
    }
    setIsLoading(false);
  }, [user, year]);

  const loadQuotes = useCallback(async () => {
    if (!currentProjectId) {
      setQuotes([]);
      return;
    };
    
    if (!user) {
      setQuotes([{
        id: `demo-quote-${Date.now()}`, project_id: currentProjectId, vendor_name: '', estimate_amount: 0,
        contact_info: '', notes: '', liked_sales_rep: false, offers_financing: false, good_timing: false,
        trustworthy: false, responsive: false, date_received: new Date().toISOString().split('T')[0]
      }]);
      return;
    }

    const { data, error } = await supabase.from('vendor_quotes').select('*').eq('project_id', currentProjectId);
    if (error) {
      toast.error("Failed to load quotes for this project.");
      return;
    }
    
    if (data && data.length > 0) {
      setQuotes(data);
    } else {
      const newQuote: Omit<VendorQuote, 'id' | 'project_id'> & { project_id: string } = {
        project_id: currentProjectId, vendor_name: '', estimate_amount: 0, contact_info: '',
        notes: '', liked_sales_rep: false, offers_financing: false, good_timing: false,
        trustworthy: false, responsive: false, date_received: new Date().toISOString().split('T')[0]
      };
      const { data: insertedQuote, error: insertError } = await supabase.from('vendor_quotes').insert(newQuote).select().single();
      if(insertError) toast.error("Failed to create initial quote.");
      else setQuotes(insertedQuote ? [insertedQuote] : []);
    }
  }, [currentProjectId, user]);

  useEffect(() => { loadProjects(); }, [loadProjects]);
  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  const addQuote = () => {
    const newQuote: VendorQuote = {
      id: `temp-${Date.now()}`, project_id: currentProjectId || '', vendor_name: '', estimate_amount: 0,
      contact_info: '', notes: '', liked_sales_rep: false, offers_financing: false, good_timing: false,
      trustworthy: false, responsive: false, date_received: new Date().toISOString().split('T')[0]
    };
    setQuotes(prev => [...prev, newQuote]);
  };
  
  const removeQuote = async (quoteId: string) => {
    if (quotes.length <= 1) {
      toast.info("You must have at least one quote.");
      return;
    }
    const quoteToRemove = quotes.find(q => q.id === quoteId);
    setQuotes(prev => prev.filter(q => q.id !== quoteId));
    if (user && quoteToRemove && !quoteToRemove.id.startsWith('temp-')) {
      const { error } = await supabase.from('vendor_quotes').delete().eq('id', quoteId);
      if (error) {
        toast.error("Failed to delete quote from database.");
        setQuotes(prev => [...prev, quoteToRemove]);
      }
    }
  };

  const updateQuote = async (updatedQuote: VendorQuote) => {
    setQuotes(prev => prev.map(q => q.id === updatedQuote.id ? updatedQuote : q));
    if (!user) return;
    
    // If this is a temp project, we need to create it first
    const currentProject = projects.find(p => p.id === currentProjectId);
    if (currentProject && currentProject.id.startsWith('temp-')) {
      const newProject = {
        user_id: user.id,
        year,
        title: currentProject.title,
        project_number: currentProject.project_number
      };

      try {
        const { data: createdProject, error } = await supabase.from('vendor_projects').insert(newProject).select().single();
        if (error) throw error;
        
        // Update the project in state
        setProjects(prev => prev.map(p => p.id === currentProject.id ? createdProject : p));
        setCurrentProjectId(createdProject.id);
        
        // Now save the quote with the real project ID
        await saveQuoteToDatabase(updatedQuote, createdProject.id);
        
      } catch (error) {
        toast.error("Failed to create project.");
        loadProjects();
        return;
      }
    } else {
      // Save to existing project
      await saveQuoteToDatabase(updatedQuote, currentProjectId!);
    }
  };

  const saveQuoteToDatabase = async (updatedQuote: VendorQuote, projectId: string) => {
    const { id, project_id, ...quoteData } = updatedQuote;
    try {
      if (id.startsWith('temp-') || id.startsWith('demo-')) {
        const { data: newRecord, error } = await supabase.from('vendor_quotes').insert({ 
          ...quoteData, 
          project_id: projectId,
          year 
        }).select().single();
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

  const updateProjectTitle = async (projectId: string, title: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, title } : p));
    if (!user) return;
    const { error } = await supabase.from('vendor_projects').update({ title }).eq('id', projectId);
    if (error) {
      toast.error("Failed to update project title.");
      loadProjects();
    }
  };

  const getRating = (q: VendorQuote) => [q.liked_sales_rep, q.offers_financing, q.good_timing, q.trustworthy, q.responsive].filter(Boolean).length;
  
  const sortedQuotes = useMemo(() => [...quotes].sort((a, b) => {
    switch (sortBy) {
      case 'amount': return a.estimate_amount - b.estimate_amount;
      case 'rating': return getRating(b) - getRating(a);
      case 'date': return new Date(b.date_received).getTime() - new Date(a.date_received).getTime();
      default: return 0;
    }
  }), [quotes, sortBy]);

  const summaryStats = useMemo(() => {
    const validQuotes = quotes.filter(q => q.estimate_amount > 0);
    if (validQuotes.length === 0) {
      return { quoteCount: quotes.length, lowestQuote: 0, highestQuote: 0, savingsPotential: 0 };
    }
    const amounts = validQuotes.map(q => q.estimate_amount);
    const lowest = Math.min(...amounts);
    const highest = Math.max(...amounts);
    return {
      quoteCount: quotes.length,
      lowestQuote: lowest,
      highestQuote: highest,
      savingsPotential: highest - lowest,
    };
  }, [quotes]);

  return {
    projects,
    quotes: sortedQuotes,
    currentProjectId,
    isLoading,
    sortBy,
    summaryStats,
    setCurrentProjectId,
    setSortBy,
    addQuote,
    removeQuote,
    updateQuote,
    updateProjectTitle,
  };
}

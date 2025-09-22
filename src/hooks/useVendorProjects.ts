// src/hooks/useVendorProjects.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner'; // Assuming you use sonner for toasts

// Types - It's good practice to keep these here or in a dedicated types file
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

// Props for the hook
interface UseVendorProjectsProps {
  user: { id: string } | null;
  year: number; // The selected year from useYear
}

export function useVendorProjects({ user, year }: UseVendorProjectsProps) {
  const [projects, setProjects] = useState<VendorProject[]>([]);
  const [quotes, setQuotes] = useState<VendorQuote[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'amount' | 'rating' | 'date'>('amount');

  // --- Data Loading ---

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    if (!user) {
      // Setup demo data for logged-out users
      const demoProjects = Array.from({ length: 3 }, (_, i) => ({
        id: `demo-${i + 1}`, user_id: 'guest', title: `Project ${i + 1}`, project_number: i + 1, year
      }));
      setProjects(demoProjects);
      setCurrentProjectId(demoProjects[0].id);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.from('vendor_projects').select('*').eq('user_id', user.id).eq('year', year).order('project_number');
      if (error) throw error;

      let allProjects = [...data];
      const existingNumbers = data.map(p => p.project_number);
      const projectsToCreate = [];

      for (let i = 1; i <= 3; i++) {
        if (!existingNumbers.includes(i)) {
          projectsToCreate.push({ user_id: user.id, year, title: `Project ${i}`, project_number: i });
        }
      }

      if (projectsToCreate.length > 0) {
        const { data: newProjects, error: insertError } = await supabase.from('vendor_projects').insert(projectsToCreate).select();
        if (insertError) throw insertError;
        allProjects = [...allProjects, ...newProjects].sort((a, b) => a.project_number - b.project_number);
      }
      
      setProjects(allProjects);
      if (allProjects.length > 0 && !allProjects.some(p => p.id === currentProjectId)) {
        setCurrentProjectId(allProjects[0].id);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects.");
    } finally {
      setIsLoading(false);
    }
  }, [user, year, currentProjectId]);

  const loadQuotes = useCallback(async () => {
    if (!currentProjectId) return;
    if (!user) {
      // For demo mode, create a default blank quote
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
      // If no quotes exist, create a default one to start with
      const newQuote: Omit<VendorQuote, 'id'> = {
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

  // --- Data Modification ---

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
    setQuotes(prev => prev.filter(q => q.id !== quoteId)); // Optimistic update

    if (user && quoteToRemove && !quoteToRemove.id.startsWith('temp-')) {
      const { error } = await supabase.from('vendor_quotes').delete().eq('id', quoteId);
      if (error) {
        toast.error("Failed to delete quote from database.");
        setQuotes(prev => [...prev, quoteToRemove]); // Revert on error
      }
    }
  };

  const updateQuote = async (updatedQuote: VendorQuote) => {
    // Update local state immediately for a responsive UI
    setQuotes(prev => prev.map(q => q.id === updatedQuote.id ? updatedQuote : q));

    if (!user) return; // Don't persist for demo users

    const { id, ...quoteData } = updatedQuote;
    
    try {
      if (id.startsWith('temp-')) {
        const { data: newRecord, error } = await supabase.from('vendor_quotes').insert(quoteData).select().single();
        if (error) throw error;
        // Replace the temporary quote with the real one from the DB
        setQuotes(prev => prev.map(q => q.id === id ? newRecord : q));
      } else {
        const { error } = await supabase.from('vendor_quotes').update(quoteData).eq('id', id);
        if (error) throw error;
      }
    } catch(error) {
      toast.error("Failed to save quote.");
      console.error(error);
      loadQuotes(); // Re-fetch to correct any optimistic UI errors
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

  // --- Derived State ---

  const getRating = (q: VendorQuote) => [q.liked_sales_rep, q.offers_financing, q.good_timing, q.trustworthy, q.responsive].filter(Boolean).length;
  
  const sortedQuotes = useMemo(() => [...quotes].sort((a, b) => {
    switch (sortBy) {
      case 'amount': return a.estimate_amount - b.estimate_amount;
      case 'rating': return getRating(b) - getRating(a);
      case 'date': return new Date(b.date_received).getTime() - new Date(a.date_received).getTime();
      default: return 0;
    }
  }), [quotes, sortBy]);

  const savingsPotential = useMemo(() => {
    const validQuotes = quotes.filter(q => q.estimate_amount > 0);
    if (validQuotes.length < 2) return 0;
    const amounts = validQuotes.map(q => q.estimate_amount);
    return Math.max(...amounts) - Math.min(...amounts);
  }, [quotes]);


  return {
    // State
    projects,
    quotes: sortedQuotes,
    currentProjectId,
    isLoading,
    sortBy,
    
    // Derived Values
    savingsPotential,

    // Actions
    setCurrentProjectId,
    setSortBy,
    addQuote,
    removeQuote,
    updateQuote,
    updateProjectTitle,
  };
}

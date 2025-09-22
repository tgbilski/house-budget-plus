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

  const loadProjects = useCallback(async () => { /* ... unchanged ... */ }, [user, year]);
  const loadQuotes = useCallback(async () => { /* ... unchanged ... */ }, [currentProjectId, user]);

  useEffect(() => { loadProjects(); }, [loadProjects]);
  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  const addQuote = () => { /* ... unchanged ... */ };
  const removeQuote = async (quoteId: string) => { /* ... unchanged ... */ };
  const updateQuote = async (updatedQuote: VendorQuote) => { /* ... unchanged ... */ };
  const updateProjectTitle = async (projectId: string, title: string) => { /* ... unchanged ... */ };

  // FIX: This logic was missing
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

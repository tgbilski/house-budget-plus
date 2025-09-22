// src/hooks/useVendorProjects.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
// ... other imports

export interface VendorProject { /* ... */ }
export interface VendorQuote { /* ... */ }
// ...

export function useVendorProjects({ user, year }: UseVendorProjectsProps) {
  // ... all the existing state and functions (loadProjects, loadQuotes, etc.) are unchanged ...
  const [projects, setProjects] = useState<VendorProject[]>([]);
  const [quotes, setQuotes] = useState<VendorQuote[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'amount' | 'rating' | 'date'>('amount');

  // ... All functions like loadProjects, loadQuotes, addQuote, etc. remain here ...
  const loadProjects = useCallback(async () => { /* ... */ });
  const loadQuotes = useCallback(async () => { /* ... */ });
  useEffect(() => { loadProjects(); }, [loadProjects]);
  useEffect(() => { loadQuotes(); }, [loadQuotes]);
  const addQuote = () => { /* ... */ };
  const removeQuote = async (quoteId: string) => { /* ... */ };
  const updateQuote = async (updatedQuote: VendorQuote) => { /* ... */ };
  const updateProjectTitle = async (projectId: string, title: string) => { /* ... */ };


  const getRating = (q: VendorQuote) => [q.liked_sales_rep, q.offers_financing, q.good_timing, q.trustworthy, q.responsive].filter(Boolean).length;
  
  const sortedQuotes = useMemo(() => { /* ... */ }, [quotes, sortBy]);

  // ADD: New summary calculations
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
    summaryStats, // MODIFIED: Return the summary object instead of individual values
    setCurrentProjectId,
    setSortBy,
    addQuote,
    removeQuote,
    updateQuote,
    updateProjectTitle,
  };
}

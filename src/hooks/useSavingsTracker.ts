// src/hooks/useSavingsTracker.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SavingsGoal {
  id: string;
  user_id: string;
  household_id: string;
  year: number;
  title: string;
  target_amount: number;
  current_amount: number;
  goal_number: number;
}

interface UseSavingsTrackerProps {
  user: { id: string } | null;
  currentHousehold: { id: string } | null;
  year: number;
}

export function useSavingsTracker({ user, currentHousehold, year }: UseSavingsTrackerProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [currentGoalId, setCurrentGoalId] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<Record<string, number>>({});
  const [allEntriesTotal, setAllEntriesTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const [editingState, setEditingState] = useState<{ id: string | null; title: string; target: number }>({ id: null, title: '', target: 0 });

  // 
  
  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    let baseGoals: SavingsGoal[] = Array.from({ length: 3 }, (_, i) => ({
      id: `temp-${i + 1}-${Date.now()}`, user_id: user?.id || 'guest', household_id: currentHousehold?.id || 'guest',
      year: 2025, title: `Goal ${i + 1}`, goal_number: i + 1, target_amount: 0, current_amount: 0,
    }));
    if (user && currentHousehold) {
      try {
        const { data: dbGoals, error } = await supabase
          .from('savings_goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('household_id', currentHousehold.id)
          .order('goal_number', { ascending: true });
        if (error) throw error;
        if (dbGoals && dbGoals.length > 0) {
          dbGoals.forEach(dbGoal => {
            const index = baseGoals.findIndex(g => g.goal_number === dbGoal.goal_number);
            if (index !== -1) { baseGoals[index] = dbGoal; }
          });
        }
      } catch (error) {
        toast.error("Failed to load savings goals.");
      }
    }
    setGoals(baseGoals);
    if (baseGoals.length > 0) {
      setCurrentGoalId(currentId => baseGoals.some(g => g.id === currentId) ? currentId : baseGoals[0].id);
    }
    setIsLoading(false);
  }, [user, currentHousehold]);
  
  // --- FIXED: Safe Date Parsing ---
  const fetchMonthlyData = useCallback(async () => {
    if (!currentGoalId || !user || currentGoalId.startsWith('temp-')) {
      setMonthlyData({});
      setAllEntriesTotal(0);
      return;
    }

    try {
      const { data: allEntries, error: allError } = await supabase
        .from('savings_entries')
        .select('*')
        .eq('goal_id', currentGoalId);

      if (allError) throw allError;

      const total = allEntries?.reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0;
      setAllEntriesTotal(total);

      // FIX: Parse YYYY-MM-DD manually to avoid Time Zone shifts
      const monthlyMap: Record<string, number> = {};
      allEntries?.forEach(entry => {
        // entry.entry_month is "YYYY-MM-DD"
        if (!entry.entry_month) return;
        
        const [yStr, mStr] = entry.entry_month.split('-'); // ["2025", "02", "01"]
        const entryYear = parseInt(yStr);
        const entryMonthIndex = parseInt(mStr) - 1; // 0-based index (0 = Jan)

        if (entryYear === year) {
          monthlyMap[entryMonthIndex.toString()] = entry.amount;
        }
      });
      
      setMonthlyData(monthlyMap);
    } catch (error) {
      console.error("Failed to load monthly savings data:", error);
      toast.error("Failed to load monthly savings data.");
    }
  }, [currentGoalId, user, year]);


  useEffect(() => { fetchGoals(); }, [fetchGoals]);
  useEffect(() => { fetchMonthlyData(); }, [fetchMonthlyData]);
  
  const updateGoal = async (goalId: string, title: string, target: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, title, target_amount: target } : g));
    setEditingState({ id: null, title: '', target: 0 });

    if (!user) return;

    if (goalId.startsWith('temp-')) {
      const newGoal = {
        user_id: user.id,
        household_id: currentHousehold?.id || '',
        year: 2025,
        title,
        goal_number: goal.goal_number,
        target_amount: target,
        current_amount: 0
      };

      try {
        const { data, error } = await supabase.from('savings_goals').insert(newGoal).select().single();
        if (error) throw error;
        setGoals(prev => prev.map(g => g.id === goalId ? data : g));
        if (currentGoalId === goalId) {
          setCurrentGoalId(data.id);
        }
        toast.success("Goal saved!");
      } catch (error) {
        toast.error("Failed to save goal.");
        fetchGoals();
      }
    } else {
      try {
        const { error } = await supabase.from('savings_goals').update({ title, target_amount: target }).eq('id', goalId);
        if (error) throw error;
        toast.success("Goal updated!");
      } catch (error) {
        toast.error("Failed to update goal.");
        fetchGoals();
      }
    }
  };

  const updateMonthlyAmount = async (monthIndex: number, amount: number | null) => {
    const currentGoal = goals.find(g => g.id === currentGoalId);
    if (!currentGoal || !user) return;

    const monthKey = monthIndex.toString();
    const oldAmount = monthlyData[monthKey] || 0;
    
    // Optimistic Update
    if (amount === null || amount === 0) {
      setMonthlyData(prev => {
        const newData = { ...prev };
        delete newData[monthKey];
        return newData;
      });
      setAllEntriesTotal(prev => prev - oldAmount);
      
      if (!currentGoal.id.startsWith('temp-')) {
        await deleteMonthlyEntry(currentGoal.id, monthIndex);
      }
      return;
    }
    
    setMonthlyData(prev => ({ ...prev, [monthKey]: amount }));
    setAllEntriesTotal(prev => prev - oldAmount + amount);

    if (currentGoal.id.startsWith('temp-')) {
      // Create temp goal first... (logic unchanged)
      const newGoal = {
        user_id: user.id,
        household_id: currentHousehold?.id || '',
        year: 2025,
        title: currentGoal.title,
        goal_number: currentGoal.goal_number,
        target_amount: currentGoal.target_amount,
        current_amount: 0
      };

      try {
        const { data, error } = await supabase.from('savings_goals').insert(newGoal).select().single();
        if (error) throw error;
        
        setGoals(prev => prev.map(g => g.id === currentGoal.id ? data : g));
        setCurrentGoalId(data.id);
        
        await saveMonthlyEntry(data.id, monthIndex, amount);
        
      } catch (error) {
        toast.error("Failed to create goal.");
        fetchGoals();
        return;
      }
    } else {
      await saveMonthlyEntry(currentGoal.id, monthIndex, amount);
    }
  };
  
  // --- FIXED: Safe Date Deletion ---
  const deleteMonthlyEntry = async (goalId: string, monthIndex: number) => {
    // Construct YYYY-MM-DD manually
    const dateString = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
    
    try {
      const { error } = await supabase
        .from('savings_entries')
        .delete()
        .eq('goal_id', goalId)
        .eq('entry_month', dateString); // Use string directly
      
      if (error) throw error;
    } catch (error) {
      console.error("Failed to delete monthly entry:", error);
      fetchMonthlyData();
    }
  };

  // --- FIXED: Safe Date Saving ---
  const saveMonthlyEntry = async (goalId: string, monthIndex: number, amount: number) => {
    // Construct YYYY-MM-DD manually to prevent Time Zone conversion issues
    const dateString = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;

    try {
      const { data: existingEntry, error: fetchError } = await supabase
        .from('savings_entries')
        .select('id')
        .eq('goal_id', goalId)
        .eq('entry_month', dateString)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingEntry) {
        const { error } = await supabase
          .from('savings_entries')
          .update({ amount })
          .eq('id', existingEntry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('savings_entries')
          .insert({
            goal_id: goalId,
            amount,
            entry_month: dateString,
            year
          });
        if (error) throw error;
      }
    } catch (error) {
      toast.error("Failed to save monthly amount.");
      fetchMonthlyData();
    }
  };

  const currentGoal = useMemo(() => goals.find(g => g.id === currentGoalId), [goals, currentGoalId]);
  const totalSaved = allEntriesTotal;

  return {
    goals,
    currentGoal,
    currentGoalId,
    monthlyData,
    totalSaved,
    isLoading,
    editingState,
    setEditingState,
    setCurrentGoalId,
    updateGoal,
    updateMonthlyAmount,
  };
}

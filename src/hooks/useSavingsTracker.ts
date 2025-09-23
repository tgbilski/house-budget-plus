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
  const [isLoading, setIsLoading] = useState(true);

  // FIX: Add state to manage the editing of goal titles
  const [editingState, setEditingState] = useState<{ id: string | null; title: string }>({ id: null, title: '' });

  const fetchGoals = useCallback(async () => {
    // ... This function remains the same from the last version ...
    setIsLoading(true);
    let baseGoals: SavingsGoal[] = Array.from({ length: 3 }, (_, i) => ({
      id: `temp-${i + 1}-${Date.now()}`, user_id: user?.id || 'guest', household_id: currentHousehold?.id || 'guest',
      year, title: `Goal ${i + 1}`, goal_number: i + 1, target_amount: 0, current_amount: 0,
    }));
    if (user && currentHousehold) {
      try {
        const { data: dbGoals, error } = await supabase.from('savings_goals').select('*').eq('user_id', user.id).eq('household_id', currentHousehold.id).eq('year', year);
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
  }, [user, currentHousehold, year]);
  
  const fetchMonthlyData = useCallback(async () => {
    if (!currentGoalId || !user) {
      setMonthlyData({});
      return;
    }

    try {
      const { data, error } = await supabase
        .from('savings_entries')
        .select('*')
        .eq('goal_id', currentGoalId);

      if (error) throw error;

      const monthlyMap: Record<string, number> = {};
      data?.forEach(entry => {
        const monthKey = new Date(entry.entry_month).getMonth().toString();
        monthlyMap[monthKey] = entry.amount;
      });
      
      setMonthlyData(monthlyMap);
    } catch (error) {
      toast.error("Failed to load monthly savings data.");
    }
  }, [currentGoalId, user]);


  useEffect(() => { fetchGoals(); }, [fetchGoals]);
  useEffect(() => { fetchMonthlyData(); }, [fetchMonthlyData]);
  
  // FIX: Add the function to update the goal title
  const updateGoalTitle = async (goalId: string, title: string) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, title } : g));
    setEditingState({ id: null, title: '' }); // Exit editing mode

    if (!user) return; // Don't save for guests

    const { error } = await supabase.from('savings_goals').update({ title }).eq('id', goalId);
    if (error) {
      toast.error("Failed to update goal title.");
      fetchGoals(); // Revert on error
    } else {
      toast.success("Goal title updated!");
    }
  };

  const updateGoalTarget = async (target: number) => {
    if (!currentGoal || !user) return;

    setGoals(prev => prev.map(g => g.id === currentGoal.id ? { ...g, target_amount: target } : g));

    if (currentGoal.id.startsWith('temp-')) {
      const newGoal = {
        user_id: user.id,
        household_id: currentHousehold?.id || '',
        year,
        title: currentGoal.title,
        goal_number: currentGoal.goal_number,
        target_amount: target,
        current_amount: 0
      };

      try {
        const { data, error } = await supabase.from('savings_goals').insert(newGoal).select().single();
        if (error) throw error;
        setGoals(prev => prev.map(g => g.id === currentGoal.id ? data : g));
        setCurrentGoalId(data.id);
      } catch (error) {
        toast.error("Failed to save goal target.");
        fetchGoals();
      }
    } else {
      try {
        const { error } = await supabase.from('savings_goals').update({ target_amount: target }).eq('id', currentGoal.id);
        if (error) throw error;
      } catch (error) {
        toast.error("Failed to update goal target.");
        fetchGoals();
      }
    }
  };

  const updateMonthlyAmount = async (monthIndex: number, amount: number) => {
    if (!currentGoal || !user) return;

    const monthKey = monthIndex.toString();
    setMonthlyData(prev => ({ ...prev, [monthKey]: amount }));

    // Create first day of the month for the entry
    const entryDate = new Date(year, monthIndex, 1);

    try {
      // Check if entry exists
      const { data: existingEntry, error: fetchError } = await supabase
        .from('savings_entries')
        .select('id')
        .eq('goal_id', currentGoal.id)
        .eq('entry_month', entryDate.toISOString().split('T')[0])
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('savings_entries')
          .update({ amount })
          .eq('id', existingEntry.id);
        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('savings_entries')
          .insert({
            goal_id: currentGoal.id,
            amount,
            entry_month: entryDate.toISOString().split('T')[0],
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

  // FIX: Add the new state and functions to the return object
  return {
    goals,
    currentGoal,
    currentGoalId,
    monthlyData,
    isLoading,
    editingState, // Provide the state for the component
    setEditingState, // Provide the function to change the state
    setCurrentGoalId,
    updateGoalTitle, // Provide the function to save the title
    updateGoalTarget,
    updateMonthlyAmount,
  };
}

// src/hooks/useSavingsTracker.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define the types for our data structures
interface SavingsGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  goal_number: number;
}

interface SavingsEntry {
  id: string;
  amount: number;
  entry_month: string;
  goal_id: string;
}

// Define the props our hook will accept
interface UseSavingsTrackerProps {
  user: { id: string } | null;
  currentHousehold: { id: string } | null;
}

export function useSavingsTracker({ user, currentHousehold }: UseSavingsTrackerProps) {
  // State Management
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [currentGoalId, setCurrentGoalId] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<Record<string, number>>({});
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<{ id: string | null; title: string }>({ id: null, title: '' });

  // Memoized value to find the current goal efficiently
  const currentGoal = useMemo(() => goals.find(g => g.id === currentGoalId), [goals, currentGoalId]);

  // --- Data Fetching Functions ---

  const fetchGoals = useCallback(async () => {
    if (!user || !currentHousehold) {
      // Initialize demo goals for logged-out users
      const demoGoals = Array.from({ length: 3 }, (_, i) => ({
        id: `demo-${i + 1}`,
        title: `Goal ${i + 1}`,
        target_amount: 0,
        current_amount: 0,
        goal_number: i + 1,
      }));
      setGoals(demoGoals);
      setCurrentGoalId(demoGoals[0].id);
      return;
    }

    try {
      const { data: existingGoals, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('household_id', currentHousehold.id)
        .eq('year', year)
        .order('goal_number', { ascending: true });

      if (error) throw error;

      // Logic to create goals 1, 2, 3 if they don't exist for the user/year
      let allGoals = [...existingGoals];
      const existingGoalNumbers = existingGoals.map(g => g.goal_number);
      const goalsToCreate = [];

      for (let i = 1; i <= 3; i++) {
        if (!existingGoalNumbers.includes(i)) {
          goalsToCreate.push({
            user_id: user.id,
            household_id: currentHousehold.id,
            year: year,
            title: `Goal ${i}`,
            goal_number: i,
            target_amount: 0,  // FIX: Ensure new goals have a default target
            current_amount: 0, // FIX: Ensure new goals have a default current amount
          });
        }
      }

      if (goalsToCreate.length > 0) {
        const { data: newGoals, error: insertError } = await supabase
          .from('savings_goals')
          .insert(goalsToCreate)
          .select();
        
        if (insertError) throw insertError;
        allGoals = [...allGoals, ...newGoals].sort((a, b) => a.goal_number - b.goal_number);
      }
      
      setGoals(allGoals);
      if (allGoals.length > 0 && !currentGoalId) {
        setCurrentGoalId(allGoals[0].id);
      }
    } catch (error) {
      console.error('Error loading savings goals:', error);
      toast.error('Failed to load savings goals.');
    }
  }, [user, currentHousehold, year, currentGoalId]);

  const fetchMonthlyData = useCallback(async () => {
    if (!currentGoalId || !user) {
        setMonthlyData({});
        return;
    };
    
    // Don't fetch for demo goals
    if (currentGoalId.startsWith('demo-')) return;

    try {
      const { data, error } = await supabase
        .from('savings_entries')
        .select('entry_month, amount')
        .eq('goal_id', currentGoalId)
        .eq('year', year);

      if (error) throw error;

      const dataMap = data.reduce((acc, entry) => {
        acc[entry.entry_month.slice(0, 7)] = entry.amount;
        return acc;
      }, {} as Record<string, number>);
      
      setMonthlyData(dataMap);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      toast.error('Failed to load monthly savings data.');
    }
  }, [currentGoalId, year, user]);


  // --- Main Effects to Trigger Fetching ---

  useEffect(() => {
    setIsLoading(true);
    fetchGoals().finally(() => setIsLoading(false));
  }, [fetchGoals]);

  useEffect(() => {
    fetchMonthlyData();
  }, [fetchMonthlyData]);

  // --- Database Update Functions ---

  const updateGoalTitle = async (goalId: string, title: string) => {
    if (!user) {
        setGoals(prev => prev.map(g => g.id === goalId ? { ...g, title } : g));
        return;
    }
    // Optimistic UI update
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, title } : g));

    const { error } = await supabase.from('savings_goals').update({ title }).eq('id', goalId);
    if (error) {
      toast.error('Failed to update title.');
      // Revert on error
      fetchGoals(); 
    } else {
      toast.success('Goal title updated!');
    }
    setIsEditing({ id: null, title: '' });
  };
  
  const updateGoalTarget = async (target: number) => {
    if (!currentGoalId) return;
    if (!user) {
        setGoals(prev => prev.map(g => g.id === currentGoalId ? { ...g, target_amount: target } : g));
        return;
    }

    setGoals(prev => prev.map(g => g.id === currentGoalId ? { ...g, target_amount: target } : g));
    const { error } = await supabase.from('savings_goals').update({ target_amount: target }).eq('id', currentGoalId);
    if (error) {
      toast.error('Failed to update target.');
      fetchGoals();
    }
  };

  const updateMonthlyAmount = async (monthIndex: number, amount: number) => {
    if (!currentGoalId || !user) {
        const monthKey = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}`;
        const newData = { ...monthlyData, [monthKey]: amount };
        setMonthlyData(newData);
        
        const total = Object.values(newData).reduce((sum, val) => sum + val, 0);
        setGoals(prev => prev.map(g => g.id === currentGoalId ? { ...g, current_amount: total } : g));
        return;
    }
    
    // This is where you would call your SINGLE Supabase Edge Function
    // For now, we'll keep the logic client-side but it should be moved.
    console.log("In a real app, this would call an Edge Function.");

    // The logic below is what should be inside your Edge Function
    const monthKey = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}`;
    const entryDate = `${monthKey}-01`;
    const newMonthlyData = { ...monthlyData, [monthKey]: amount };
    if (amount === 0) delete newMonthlyData[monthKey];
    
    // Client-side optimistic updates
    setMonthlyData(newMonthlyData);
    const total = Object.values(newMonthlyData).reduce((sum, val) => sum + val, 0);
    setGoals(prev => prev.map(g => g.id === currentGoalId ? { ...g, current_amount: total } : g));

    const { data: existing } = await supabase.from('savings_entries').select('id').eq('goal_id', currentGoalId).eq('entry_month', entryDate).single();

    if (existing) {
        await supabase.from('savings_entries').update({ amount }).eq('id', existing.id);
    } else if (amount > 0) {
        await supabase.from('savings_entries').insert({ goal_id: currentGoalId, amount, entry_month: entryDate, year });
    }
    await supabase.from('savings_goals').update({ current_amount: total }).eq('id', currentGoalId);
  };


  // --- Memoized Calculations for UI ---

  const totalSaved = useMemo(() => Object.values(monthlyData).reduce((sum, val) => sum + val, 0), [monthlyData]);
  
  const progressPercentage = useMemo(() => {
    if (!currentGoal || !currentGoal.target_amount) return 0;
    return Math.min((totalSaved / currentGoal.target_amount) * 100, 100);
  }, [currentGoal, totalSaved]);

  
  // --- Return all state and functions needed by the UI ---
  
  return {
    // State
    goals,
    currentGoal,
    currentGoalId,
    monthlyData,
    year,
    isLoading,
    isEditing,

    // Setters & Actions
    setYear,
    setCurrentGoalId,
    updateGoalTitle,
    updateGoalTarget,
    updateMonthlyAmount,
    setIsEditing,
  };
}

// src/hooks/useVacationPlanner.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Keep the type definition with the hook for clarity
export interface VacationOption {
  id: string;
  user_id: string;
  year: number;
  vacation_number: number;
  destination: string;
  travel_mode: string;
  travel_mode_cost: number;
  lodging_cost: number;
  car_rental_cost: number;
  notes: string;
  family_friendly: boolean;
  good_weather: boolean;
  activities_available: boolean;
  affordable: boolean;
  relaxing: boolean;
  adventurous: boolean;
  memorable: boolean;
}

interface UseVacationPlannerProps {
  user: { id: string } | null;
  year: number;
}

export function useVacationPlanner({ user, year }: UseVacationPlannerProps) {
  const [options, setOptions] = useState<VacationOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Loading ---

  const loadVacationOptions = useCallback(async () => {
    setIsLoading(true);
    if (!user) {
      // Setup demo data for logged-out users
      const demoOptions = Array.from({ length: 3 }, (_, i) => ({
        id: `demo-${i + 1}`, user_id: 'guest', year, vacation_number: i + 1, destination: '', travel_mode: '', 
        travel_mode_cost: 0, lodging_cost: 0, car_rental_cost: 0, notes: '', family_friendly: false, 
        good_weather: false, activities_available: false, affordable: false, relaxing: false, 
        adventurous: false, memorable: false
      }));
      setOptions(demoOptions);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.from('vacation_options').select('*').eq('user_id', user.id).eq('year', year).order('vacation_number');
      if (error) throw error;

      let allOptions = [...data];
      const existingNumbers = data.map(o => o.vacation_number);
      const optionsToCreate = [];

      for (let i = 1; i <= 3; i++) {
        if (!existingNumbers.includes(i)) {
          optionsToCreate.push({
            user_id: user.id, year, vacation_number: i, destination: '', travel_mode: '', travel_mode_cost: 0,
            lodging_cost: 0, car_rental_cost: 0, notes: '', family_friendly: false, good_weather: false,
            activities_available: false, affordable: false, relaxing: false, adventurous: false, memorable: false
          });
        }
      }

      if (optionsToCreate.length > 0) {
        const { data: newOptions, error: insertError } = await supabase.from('vacation_options').insert(optionsToCreate).select();
        if (insertError) throw insertError;
        allOptions = [...allOptions, ...newOptions].sort((a, b) => a.vacation_number - b.vacation_number);
      }
      setOptions(allOptions);
    } catch (error) {
      console.error("Error loading vacation options:", error);
      toast.error("Failed to load vacation plans.");
    } finally {
      setIsLoading(false);
    }
  }, [user, year]);

  useEffect(() => {
    loadVacationOptions();
  }, [loadVacationOptions]);

  // --- Data Modification ---

  const updateVacationOption = async (optionId: string, updates: Partial<VacationOption>) => {
    // Optimistic UI update for a snappy feel
    setOptions(prev => prev.map(opt => (opt.id === optionId ? { ...opt, ...updates } : opt)));

    if (!user || optionId.startsWith('demo-')) return; // Don't save for demo users

    const { error } = await supabase.from('vacation_options').update(updates).eq('id', optionId);

    if (error) {
      toast.error("Failed to save your changes.");
      console.error(error);
      loadVacationOptions(); // Re-fetch to revert optimistic update on error
    }
  };

  const resetVacationOption = async (optionId: string) => {
    const resetData = {
      destination: '', travel_mode: '', travel_mode_cost: 0, lodging_cost: 0, car_rental_cost: 0,
      notes: '', family_friendly: false, good_weather: false, activities_available: false,
      affordable: false, relaxing: false, adventurous: false, memorable: false
    };
    await updateVacationOption(optionId, resetData);
    toast.success(`Vacation option has been reset.`);
  };

  // --- Derived State ---

  const totalBudget = useMemo(() => {
    return options.reduce((total, opt) => total + (opt.travel_mode_cost || 0) + (opt.lodging_cost || 0) + (opt.car_rental_cost || 0), 0);
  }, [options]);

  const bestOption = useMemo(() => {
    if (options.length === 0) return null;
    
    const getScore = (option: VacationOption) => [
        option.family_friendly, option.good_weather, option.activities_available,
        option.affordable, option.relaxing, option.adventurous, option.memorable
    ].filter(Boolean).length;

    return options
      .map(option => ({ ...option, score: getScore(option) }))
      .reduce((best, current) => (current.score > best.score ? current : best));
  }, [options]);


  return {
    // State
    options,
    isLoading,
    
    // Derived Values
    totalBudget,
    bestOption,

    // Actions
    updateVacationOption,
    resetVacationOption,
  };
}

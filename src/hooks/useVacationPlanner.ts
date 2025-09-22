// src/hooks/useVacationPlanner.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  const loadVacationOptions = useCallback(async () => {
    setIsLoading(true);

    // Step 1: ALWAYS create three default empty options first for a consistent structure.
    let baseOptions: VacationOption[] = Array.from({ length: 3 }, (_, i) => ({
      id: `temp-${i + 1}-${Date.now()}`, user_id: user?.id || 'guest', year, vacation_number: i + 1, destination: '', 
      travel_mode: '', travel_mode_cost: 0, lodging_cost: 0, car_rental_cost: 0, notes: '', 
      family_friendly: false, good_weather: false, activities_available: false, affordable: false, 
      relaxing: false, adventurous: false, memorable: false
    }));

    // Step 2: If the user is signed in, fetch their real data.
    if (user) {
      try {
        const { data: dbOptions, error } = await supabase.from('vacation_options').select('*').eq('user_id', user.id).eq('year', year);
        if (error) throw error;

        // Step 3: Merge the real data into the base structure.
        if (dbOptions && dbOptions.length > 0) {
          dbOptions.forEach(dbOption => {
            const index = baseOptions.findIndex(opt => opt.vacation_number === dbOption.vacation_number);
            if (index !== -1) {
              baseOptions[index] = dbOption; // Replace the empty slot with real data
            }
          });
        }
      } catch (error) {
        console.error("Error loading vacation options:", error);
        toast.error("Failed to load vacation plans.");
      }
    }

    // Step 4: Set the final, merged options and finish loading.
    setOptions(baseOptions);
    setIsLoading(false);
  }, [user, year]);

  useEffect(() => {
    loadVacationOptions();
  }, [loadVacationOptions]);

  const updateVacationOption = async (optionId: string, updates: Partial<VacationOption>) => {
    setOptions(prev => prev.map(opt => (opt.id === optionId ? { ...opt, ...updates } : opt)));
    if (!user || optionId.startsWith('temp-')) return;
    const { error } = await supabase.from('vacation_options').update(updates).eq('id', optionId);
    if (error) {
      toast.error("Failed to save your changes.");
      loadVacationOptions();
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

  return { options, isLoading, totalBudget, bestOption, updateVacationOption, resetVacationOption };
}

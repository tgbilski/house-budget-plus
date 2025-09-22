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
  
  // ADDED: State to track the current selection and editing
  const [currentOptionId, setCurrentOptionId] = useState<string | null>(null);
  const [editingState, setEditingState] = useState<{ id: string | null; title: string }>({ id: null, title: '' });

  const loadVacationOptions = useCallback(async () => {
    setIsLoading(true);
    let baseOptions: VacationOption[] = Array.from({ length: 3 }, (_, i) => ({
      id: `temp-${i + 1}-${Date.now()}`, user_id: user?.id || 'guest', year, vacation_number: i + 1, destination: '', 
      travel_mode: '', travel_mode_cost: 0, lodging_cost: 0, car_rental_cost: 0, notes: '', 
      family_friendly: false, good_weather: false, activities_available: false, affordable: false, 
      relaxing: false, adventurous: false, memorable: false
    }));

    if (user) {
      try {
        const { data: dbOptions, error } = await supabase.from('vacation_options').select('*').eq('user_id', user.id).eq('year', year);
        if (error) throw error;
        if (dbOptions && dbOptions.length > 0) {
          dbOptions.forEach(dbOption => {
            const index = baseOptions.findIndex(opt => opt.vacation_number === dbOption.vacation_number);
            if (index !== -1) { baseOptions[index] = dbOption; }
          });
        }
      } catch (error) {
        toast.error("Failed to load vacation plans.");
      }
    }

    setOptions(baseOptions);
    // ADDED: Set the current ID to the first option by default
    if (baseOptions.length > 0) {
      setCurrentOptionId(currentId => 
        baseOptions.some(opt => opt.id === currentId) ? currentId : baseOptions[0].id
      );
    }
    setIsLoading(false);
  }, [user, year]);

  useEffect(() => { loadVacationOptions(); }, [loadVacationOptions]);

  const updateVacationOption = async (optionId: string, updates: Partial<VacationOption>) => {
    setOptions(prev => prev.map(opt => (opt.id === optionId ? { ...opt, ...updates } : opt)));
    if (!user || optionId.startsWith('temp-')) return;
    const { error } = await supabase.from('vacation_options').update(updates).eq('id', optionId);
    if (error) {
      toast.error("Failed to save your changes.");
      loadVacationOptions();
    }
  };

  // ADDED: Function to specifically update the destination title
  const updateDestinationTitle = async (optionId: string, destination: string) => {
    await updateVacationOption(optionId, { destination });
    setEditingState({ id: null, title: '' }); // Exit editing mode
    toast.success("Destination updated!");
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

  // ADDED: A memoized value to easily find the currently selected option object
  const currentOption = useMemo(() => options.find(opt => opt.id === currentOptionId), [options, currentOptionId]);

  const totalBudget = useMemo(() => { /* ... Unchanged ... */ });
  const bestOption = useMemo(() => { /* ... Unchanged ... */ });

  return {
    options,
    isLoading,
    totalBudget,
    bestOption,
    currentOption,      // ADDED
    currentOptionId,    // ADDED
    editingState,       // ADDED
    setCurrentOptionId, // ADDED
    setEditingState,    // ADDED
    updateVacationOption,
    updateDestinationTitle, // ADDED
    resetVacationOption,
  };
}

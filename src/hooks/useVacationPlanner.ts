// src/hooks/useVacationPlanner.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Corresponds to your 'Vacation_Projects' table
export interface VacationProject {
  id: string;
  user_id: string;
  title: string;
  vacation_number: number;
  year: number;
}

// Corresponds to your 'Vacation_Options' table
export interface VacationOption {
  id: string;
  vacation_id: string; // Foreign key to VacationProject
  destination: string;
  travel_mode_cost: number;
  lodging_cost: number;
  car_rental_cost: number;
  notes: string;
  // ... add other evaluation fields if they exist on this table
}

interface UseVacationPlannerProps {
  user: { id: string } | null;
  year: number;
}

export function useVacationPlanner({ user, year }: UseVacationPlannerProps) {
  const [vacations, setVacations] = useState<VacationProject[]>([]);
  const [options, setOptions] = useState<VacationOption[]>([]);
  const [currentVacationId, setCurrentVacationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadVacations = useCallback(async () => {
    setIsLoading(true);
    let baseVacations: VacationProject[] = Array.from({ length: 3 }, (_, i) => ({
      id: `temp-${i + 1}-${Date.now()}`, user_id: user?.id || 'guest', year, title: `Vacation ${i + 1}`, vacation_number: i + 1
    }));

    if (user) {
      try {
        const { data: dbVacations, error } = await supabase.from('vacation_projects').select('*').eq('user_id', user.id).eq('year', year);
        if (error) throw error;
        if (dbVacations?.length) {
          dbVacations.forEach(dbVacation => {
            const index = baseVacations.findIndex(p => p.vacation_number === dbVacation.vacation_number);
            if (index !== -1) { baseVacations[index] = dbVacation; }
          });
        }
      } catch (error) {
        toast.error("Failed to load vacations.");
      }
    }
    
    setVacations(baseVacations);
    if (baseVacations.length > 0) {
      setCurrentVacationId(currentId => baseVacations.some(p => p.id === currentId) ? currentId : baseVacations[0].id);
    }
    setIsLoading(false);
  }, [user, year]);

  const loadOptions = useCallback(async () => {
    if (!currentVacationId) {
      setOptions([]);
      return;
    };

    if (!user || currentVacationId.startsWith('temp-')) {
      // Create a default empty option for demo/newly created vacations
      setOptions([{
        id: `demo-option-${Date.now()}`, vacation_id: currentVacationId, destination: '', travel_mode_cost: 0,
        lodging_cost: 0, car_rental_cost: 0, notes: '',
      }]);
      return;
    }

    const { data, error } = await supabase.from('vacation_options').select('*').eq('vacation_id', currentVacationId);
    if (error) {
      toast.error("Failed to load vacation options.");
      setOptions([]);
    } else if (data?.length) {
      setOptions(data);
    } else {
      // If no options exist for a real vacation, create a default one
      const { data: newOption } = await supabase.from('vacation_options').insert({ vacation_id: currentVacationId, destination: '' }).select().single();
      setOptions(newOption ? [newOption] : []);
    }
  }, [currentVacationId, user]);

  useEffect(() => { loadVacations(); }, [loadVacations]);
  useEffect(() => { loadOptions(); }, [loadOptions]);

  const addOption = () => {
    if (!currentVacationId) return;
    const newOption: VacationOption = {
      id: `temp-${Date.now()}`, vacation_id: currentVacationId, destination: '',
      travel_mode_cost: 0, lodging_cost: 0, car_rental_cost: 0, notes: '',
    };
    setOptions(prev => [...prev, newOption]);
  };
  
  const updateOption = async (updatedOption: VacationOption) => {
    setOptions(prev => prev.map(o => o.id === updatedOption.id ? updatedOption : o));
    if (!user) return;
    const { id, ...optionData } = updatedOption;
    try {
      if (id.startsWith('temp-') || id.startsWith('demo-')) {
        const { data: newRecord, error } = await supabase.from('vacation_options').insert({ ...optionData, vacation_id: currentVacationId }).select().single();
        if (error) throw error;
        setOptions(prev => prev.map(o => o.id === id ? newRecord : o));
      } else {
        const { error } = await supabase.from('vacation_options').update(optionData).eq('id', id);
        if (error) throw error;
      }
    } catch(error) {
      toast.error("Failed to save option.");
      loadOptions(); // Revert on failure
    }
  };
  
  const removeOption = async (optionId: string) => { /* ... similar to removeQuote ... */ };
  const updateVacationTitle = async (vacationId: string, title: string) => { /* ... similar to updateProjectTitle ... */ };


  return {
    vacations,
    options,
    currentVacationId,
    isLoading,
    setCurrentVacationId,
    addOption,
    removeOption,
    updateOption,
    updateVacationTitle,
  };
}

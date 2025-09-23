// src/hooks/useVacationPlanner.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VacationProject {
  id: string;
  user_id: string;
  title: string;
  vacation_number: number;
  year: number;
}

export interface VacationOption {
  id: string;
  vacation_id: string;
  destination: string;
  travel_mode_cost: number;
  lodging_cost: number;
  car_rental_cost: number;
  notes: string;
  vacation_number: number;
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
  const [editingState, setEditingState] = useState<{ id: string | null; title: string }>({ id: null, title: '' });

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
      } catch (error) { toast.error("Failed to load vacations."); }
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
    }

    const currentVacation = vacations.find(v => v.id === currentVacationId);
    if (!currentVacation) return;

    if (!user) {
      setOptions([{
        id: `demo-option-${Date.now()}`,
        vacation_id: currentVacationId,
        destination: '',
        travel_mode_cost: 0,
        lodging_cost: 0,
        car_rental_cost: 0,
        notes: '',
        vacation_number: currentVacation.vacation_number
      }]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vacation_options')
        .select('*')
        .eq('user_id', user.id)
        .eq('vacation_number', currentVacation.vacation_number)
        .eq('year', year);

      if (error) throw error;

      if (data && data.length > 0) {
        setOptions(data.map(option => ({
          id: option.id,
          vacation_id: currentVacationId,
          destination: option.destination || '',
          travel_mode_cost: option.travel_mode_cost || 0,
          lodging_cost: option.lodging_cost || 0,
          car_rental_cost: option.car_rental_cost || 0,
          notes: option.notes || '',
          vacation_number: option.vacation_number
        })));
      } else {
        const newOption = {
          user_id: user.id,
          vacation_number: currentVacation.vacation_number,
          year,
          destination: '',
          travel_mode_cost: 0,
          lodging_cost: 0,
          car_rental_cost: 0,
          notes: ''
        };
        
        const { data: insertedOption, error: insertError } = await supabase
          .from('vacation_options')
          .insert(newOption)
          .select()
          .single();

        if (insertError) {
          toast.error("Failed to create initial option.");
        } else if (insertedOption) {
          setOptions([{
            id: insertedOption.id,
            vacation_id: currentVacationId,
            destination: insertedOption.destination || '',
            travel_mode_cost: insertedOption.travel_mode_cost || 0,
            lodging_cost: insertedOption.lodging_cost || 0,
            car_rental_cost: insertedOption.car_rental_cost || 0,
            notes: insertedOption.notes || '',
            vacation_number: insertedOption.vacation_number
          }]);
        }
      }
    } catch (error) {
      toast.error("Failed to load vacation options.");
    }
  }, [currentVacationId, user, year, vacations]);

  useEffect(() => { loadVacations(); }, [loadVacations]);
  useEffect(() => { loadOptions(); }, [loadOptions]);

  const addOption = () => {
    const currentVacation = vacations.find(v => v.id === currentVacationId);
    if (!currentVacation) return;

    const newOption: VacationOption = {
      id: `temp-${Date.now()}`,
      vacation_id: currentVacationId || '',
      destination: '',
      travel_mode_cost: 0,
      lodging_cost: 0,
      car_rental_cost: 0,
      notes: '',
      vacation_number: currentVacation.vacation_number
    };
    setOptions(prev => [...prev, newOption]);
  };

  const removeOption = async (optionId: string) => {
    if (options.length <= 1) {
      toast.info("You must have at least one option.");
      return;
    }
    
    const optionToRemove = options.find(o => o.id === optionId);
    setOptions(prev => prev.filter(o => o.id !== optionId));
    
    if (user && optionToRemove && !optionToRemove.id.startsWith('temp-') && !optionToRemove.id.startsWith('demo-')) {
      const { error } = await supabase.from('vacation_options').delete().eq('id', optionId);
      if (error) {
        toast.error("Failed to delete option from database.");
        setOptions(prev => [...prev, optionToRemove]);
      }
    }
  };

  const updateOption = async (updatedOption: VacationOption) => {
    setOptions(prev => prev.map(o => o.id === updatedOption.id ? updatedOption : o));
    
    if (!user) return;

    const currentVacation = vacations.find(v => v.id === currentVacationId);
    if (!currentVacation) return;

    const { id, vacation_id, ...optionData } = updatedOption;
    const saveData = {
      ...optionData,
      user_id: user.id,
      vacation_number: currentVacation.vacation_number,
      year
    };

    try {
      if (id.startsWith('temp-') || id.startsWith('demo-')) {
        const { data: newRecord, error } = await supabase
          .from('vacation_options')
          .insert(saveData)
          .select()
          .single();
        
        if (error) throw error;
        
        setOptions(prev => prev.map(o => o.id === id ? { 
          ...updatedOption, 
          id: newRecord.id 
        } : o));
      } else {
        const { error } = await supabase
          .from('vacation_options')
          .update(saveData)
          .eq('id', id);
        
        if (error) throw error;
      }
    } catch (error) {
      toast.error("Failed to save option.");
      loadOptions();
    }
  };
  
  const updateVacationTitle = async (vacationId: string, title: string) => {
    setVacations(prev => prev.map(v => v.id === vacationId ? { ...v, title } : v));
    setEditingState({ id: null, title: '' });
    if (!user) return;
    const { error } = await supabase.from('vacation_projects').update({ title }).eq('id', vacationId);
    if (error) {
      toast.error("Failed to update title.");
      loadVacations();
    }
  };

  return {
    vacations,
    options,
    currentVacationId,
    isLoading,
    editingState,
    setCurrentVacationId,
    setEditingState,
    addOption,
    removeOption,
    updateOption,
    updateVacationTitle,
  };
}

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

  const loadOptions = useCallback(async () => { /* ... unchanged ... */ });

  useEffect(() => { loadVacations(); }, [loadVacations]);
  useEffect(() => { loadOptions(); }, [loadOptions]);

  const addOption = () => { /* ... unchanged ... */ };
  const removeOption = async (optionId: string) => { /* ... unchanged ... */ };
  const updateOption = async (updatedOption: VacationOption) => { /* ... unchanged ... */ };
  
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

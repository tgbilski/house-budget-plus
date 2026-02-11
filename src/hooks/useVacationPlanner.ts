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
  overall_rating: number | null;
  destination_lat: number | null;
  destination_lng: number | null;
  rental_url: string;
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
      id: `temp-${i + 1}-${Date.now()}`, 
      user_id: user?.id || 'guest', 
      year, 
      title: `Vacation ${i + 1}`, 
      vacation_number: i + 1
    }));

    if (user) {
      try {
        const { data: dbVacations, error } = await supabase
          .from('vacation_projects')
          .select('*')
          .eq('user_id', user.id)
          .eq('year', year);
        
        if (error) throw error;
        
        if (dbVacations?.length) {
          dbVacations.forEach(dbVacation => {
            const index = baseVacations.findIndex(p => p.vacation_number === dbVacation.vacation_number);
            if (index !== -1) { 
              baseVacations[index] = {
                id: dbVacation.id,
                user_id: dbVacation.user_id,
                title: dbVacation.title,
                vacation_number: dbVacation.vacation_number,
                year: dbVacation.year
              }; 
            }
          });
        }
      } catch (error) { 
        console.error('Error loading vacations:', error);
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
        vacation_number: currentVacation.vacation_number,
        overall_rating: null,
        destination_lat: null,
        destination_lng: null,
        rental_url: ''
      }]);
      return;
    }

    // Don't try to load options for temporary vacation projects
    if (currentVacationId.startsWith('temp-')) {
      setOptions([{
        id: `temp-option-${Date.now()}`,
        vacation_id: currentVacationId,
        destination: '',
        travel_mode_cost: 0,
        lodging_cost: 0,
        car_rental_cost: 0,
        notes: '',
        vacation_number: currentVacation.vacation_number,
        overall_rating: null,
        destination_lat: null,
        destination_lng: null,
        rental_url: ''
      }]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vacation_options')
        .select('*')
        .eq('project_id', currentVacationId);

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
          vacation_number: option.vacation_number,
          overall_rating: option.overall_rating ?? null,
          destination_lat: option.destination_lat ?? null,
          destination_lng: option.destination_lng ?? null,
          rental_url: option.contact || ''
        })));
      } else {
        // Create a temporary option for empty vacation projects
        setOptions([{
          id: `temp-option-${Date.now()}`,
          vacation_id: currentVacationId,
          destination: '',
          travel_mode_cost: 0,
          lodging_cost: 0,
          car_rental_cost: 0,
          notes: '',
          vacation_number: currentVacation.vacation_number,
        overall_rating: null,
        destination_lat: null,
        destination_lng: null,
        rental_url: ''
        }]);
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
      vacation_number: currentVacation.vacation_number,
      overall_rating: null,
      destination_lat: null,
      destination_lng: null,
      rental_url: ''
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

    // If this is a temp vacation, we need to create it first
    if (currentVacation.id.startsWith('temp-')) {
      const newVacation = {
        user_id: user.id,
        year,
        title: currentVacation.title,
        vacation_number: currentVacation.vacation_number
      };

      try {
        const { data: createdVacation, error } = await supabase.from('vacation_projects').insert(newVacation).select().single();
        if (error) throw error;
        
        // Update the vacation in state
        setVacations(prev => prev.map(v => v.id === currentVacation.id ? createdVacation : v));
        setCurrentVacationId(createdVacation.id);
        
        // Now save the option with the real vacation ID
        await saveOptionToDatabase(updatedOption, createdVacation.id);
        
      } catch (error) {
        toast.error("Failed to create vacation project.");
        loadVacations();
        return;
      }
    } else {
      // Save to existing vacation
      await saveOptionToDatabase(updatedOption, currentVacation.id);
    }
  };

  const saveOptionToDatabase = async (updatedOption: VacationOption, vacationProjectId: string) => {
    const { id, vacation_id, rental_url, ...optionData } = updatedOption;
    
    // Get vacation_number from the updatedOption itself, as it should be correct
    const saveData = {
      ...optionData,
      contact: rental_url || null,
      project_id: vacationProjectId,
      user_id: user!.id,
      vacation_number: updatedOption.vacation_number,
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

    // Find the vacation to get its vacation_number
    const vacation = vacations.find(v => v.id === vacationId);
    if (!vacation) return;

    if (vacationId.startsWith('temp-')) {
      // Create new vacation project
      const newProject = {
        user_id: user.id,
        title,
        vacation_number: vacation.vacation_number,
        year
      };

      try {
        const { data, error } = await supabase.from('vacation_projects').insert(newProject).select().single();
        if (error) throw error;
        
        setVacations(prev => prev.map(v => v.id === vacationId ? data : v));
        setCurrentVacationId(data.id);
      } catch (error) {
        toast.error("Failed to save vacation title.");
        loadVacations();
      }
    } else {
      // Update existing vacation project
      try {
        const { error } = await supabase.from('vacation_projects').update({ title }).eq('id', vacationId);
        if (error) throw error;
      } catch (error) {
        toast.error("Failed to update vacation title.");
        loadVacations();
      }
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

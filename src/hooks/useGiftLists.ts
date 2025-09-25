// src/hooks/useGiftLists.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { useYear } from '@/hooks/useYear';
import { supabase } from '@/integrations/supabase/client';

interface GiftListData {
  id: string;
  user_id: string;
  list_title: string;
  budget_target: number;
  household_id?: string;
  year: number;
  created_at: string;
  updated_at: string;
}

export function useGiftLists() {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { selectedYear } = useYear();

  const [giftLists, setGiftLists] = useState<GiftListData[]>([]);
  const [selectedList, setSelectedList] = useState<GiftListData | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadGiftLists = useCallback(async () => {
    setLoading(true);
    // This handles the case for a user who is not logged in.
    if (!user || !currentHousehold) {
      const demoLists = Array.from({ length: 4 }, (_, i) => ({
        id: `temp-${i + 1}`, user_id: 'guest', list_title: `Gift List ${i + 1}`,
        budget_target: 0, year: selectedYear, household_id: 'guest',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }));
      setGiftLists(demoLists);
      setSelectedList(demoLists[0]);
      setLoading(false);
      return;
    }

    // This is the logic for a logged-in user.
    try {
      const { data: lists, error } = await supabase
        .from('gift_lists').select('*').eq('user_id', user.id)
        .eq('household_id', currentHousehold.id).eq('year', selectedYear);
      if (error) throw error;

      let allLists = [...(lists || [])];
      const missingLists = [];
      // Check if the 4 default lists exist.
      for (let i = 1; i <= 4; i++) {
        if (!allLists.some(l => l.list_title === `Gift List ${i}`)) {
          missingLists.push({
            user_id: user.id, household_id: currentHousehold.id,
            list_title: `Gift List ${i}`, budget_target: 0, year: selectedYear,
          });
        }
      }

      // If any lists are missing, create them in the database.
      if (missingLists.length > 0) {
        const { data: newLists, error: insertError } = await supabase
          .from('gift_lists').insert(missingLists).select();
        if (insertError) throw insertError;
        allLists = [...allLists, ...(newLists || [])];
      }
      
      const sortedLists = allLists.sort((a, b) => a.list_title.localeCompare(b.list_title));
      setGiftLists(sortedLists);
      
      // Set the first list as selected by default.
      if (sortedLists.length > 0) {
        setSelectedList(sortedLists[0]);
      }

    } catch (error) {
      console.error('Error loading gift lists:', error);
    } finally {
      setLoading(false);
    }
  }, [user, currentHousehold, selectedYear]);

  useEffect(() => {
    loadGiftLists();
  }, [loadGiftLists]);

  const selectList = (list: GiftListData) => {
    setSelectedList(list);
  };

  const startEditing = (list: GiftListData) => {
    setEditingListId(list.id);
    setEditingTitle(list.list_title);
  };

  const saveTitle = async (list: GiftListData) => {
    if (!user) { // Handle demo user case
        const updatedLists = giftLists.map(l => l.id === list.id ? { ...l, list_title: editingTitle } : l);
        setGiftLists(updatedLists);
    } else { // Handle authenticated user
        const { error } = await supabase.from('gift_lists').update({ list_title: editingTitle }).eq('id', list.id);
        if (!error) {
            const updatedLists = giftLists.map(l => l.id === list.id ? { ...l, list_title: editingTitle } : l);
            setGiftLists(updatedLists);
        } else {
            console.error("Failed to save title:", error);
        }
    }
    setEditingListId(null);
  };
  
  const cancelEditing = () => {
    setEditingListId(null);
    setEditingTitle('');
  };

  return {
    loading, giftLists, selectedList, editingListId, editingTitle,
    setEditingTitle, selectList, startEditing, saveTitle, cancelEditing, loadGiftLists
  };
}

// src/hooks/useGiftLists.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { useYear } from '@/hooks/useYear';
import { supabase } from '@/integrations/supabase/client';

// Re-using your interface is perfect
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

  // Add types for all state variables
  const [giftLists, setGiftLists] = useState<GiftListData[]>([]);
  const [selectedList, setSelectedList] = useState<GiftListData | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadGiftLists = useCallback(async () => {
    // ... (logic inside is the same)
  }, [user, currentHousehold, selectedYear]);

  useEffect(() => {
    loadGiftLists();
  }, [loadGiftLists]);

  // Add type for the 'list' parameter
  const selectList = (list: GiftListData) => {
    setSelectedList(list);
  };

  // Add type for the 'list' parameter
  const startEditing = (list: GiftListData) => {
    setEditingListId(list.id);
    setEditingTitle(list.list_title);
  };
  
  // Add type for the 'list' parameter
  const saveTitle = async (list: GiftListData) => {
    // ... (logic inside is the same)
  };
  
  const cancelEditing = () => {
    setEditingListId(null);
    setEditingTitle('');
  };

  return {
    loading,
    giftLists,
    selectedList,
    editingListId,
    editingTitle,
    setEditingTitle,
    selectList,
    startEditing,
    saveTitle,
    cancelEditing,
    loadGiftLists
  };
}

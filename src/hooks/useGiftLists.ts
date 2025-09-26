// src/hooks/useGiftLists.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { useYear } from '@/hooks/useYear';

export interface GiftListData {
  id: string;
  list_title: string;
  user_id: string;
  household_id: string;
  year: number;
  budget_target?: number;
  created_at: string;
  updated_at: string;
}

export interface GiftItemData {
  id: string;
  list_id: string;
  gift_idea: string;
  price: number;
  url: string;
}

export function useGiftLists() {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { selectedYear } = useYear();
  const [loading, setLoading] = useState(true);
  const [giftLists, setGiftLists] = useState<GiftListData[]>([]);
  const [selectedList, setSelectedList] = useState<GiftListData | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const loadGiftLists = useCallback(async () => {
    // For non-authenticated users, set loading to false and return empty data
    if (!user || !currentHousehold) {
      setLoading(false);
      setGiftLists([]);
      setSelectedList(null);
      return;
    }
    
    setLoading(true);
    try {
      // Check if gift lists exist for this user/household/year
      const { data: existingLists, error: fetchError } = await supabase
        .from('gift_lists')
        .select('*')
        .eq('user_id', user.id)
        .eq('household_id', currentHousehold.id)
        .eq('year', selectedYear)
        .order('list_title', { ascending: true });
      
      if (fetchError) throw fetchError;
      
      // If no lists exist or less than 4, create the default 4 gift lists
      if (!existingLists || existingLists.length < 4) {
        const defaultTitles = ['Gift List 1', 'Gift List 2', 'Gift List 3', 'Gift List 4'];
        const existingTitles = existingLists?.map(list => list.list_title) || [];
        
        // Create missing lists
        const listsToCreate = defaultTitles.filter(title => !existingTitles.includes(title));
        
        if (listsToCreate.length > 0) {
          const { error: insertError } = await supabase
            .from('gift_lists')
            .insert(
              listsToCreate.map(title => ({
                user_id: user.id,
                household_id: currentHousehold.id,
                year: selectedYear,
                list_title: title,
                budget_target: 0
              }))
            );
          
          if (insertError) throw insertError;
        }
        
        // Refetch all lists after creation
        const { data: allLists, error: refetchError } = await supabase
          .from('gift_lists')
          .select('*')
          .eq('user_id', user.id)
          .eq('household_id', currentHousehold.id)
          .eq('year', selectedYear)
          .order('list_title', { ascending: true });
        
        if (refetchError) throw refetchError;
        setGiftLists(allLists || []);
        if (allLists && allLists.length > 0 && !selectedList) {
          setSelectedList(allLists[0]);
        }
      } else {
        setGiftLists(existingLists);
        if (existingLists.length > 0 && !selectedList) {
          setSelectedList(existingLists[0]);
        }
      }
    } catch (error) {
      console.error('Error loading gift lists:', error);
    } finally {
      setLoading(false);
    }
  }, [user, currentHousehold, selectedYear, selectedList]);

  useEffect(() => {
    loadGiftLists();
  }, [loadGiftLists]);

  const selectList = (list: GiftListData) => {
    setSelectedList(list);
  };

  const startEditing = (listId: string, currentTitle: string) => {
    setEditingListId(listId);
    setEditingTitle(currentTitle);
  };

  const saveTitle = async () => {
    if (!editingListId || !editingTitle.trim()) return;
    
    try {
      const { error } = await supabase
        .from('gift_lists')
        .update({ list_title: editingTitle.trim() })
        .eq('id', editingListId);
      
      if (error) throw error;
      
      await loadGiftLists();
      setEditingListId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error saving title:', error);
    }
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

export function useGiftItems(listId: string | undefined) {
  const [items, setItems] = useState<GiftItemData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!listId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gift_items')
        .select('*')
        .eq('list_id', listId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching gift items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const deleteItem = async (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    const { error } = await supabase.from('gift_items').delete().eq('id', itemId);
    if (error) {
      console.error('Failed to delete item, reverting UI:', error);
      fetchItems();
    }
  };

  const saveItem = async (itemData: Partial<GiftItemData>) => {
    if (!listId) return;

    if (itemData.id) { // Update existing item
      const { error } = await supabase.from('gift_items').update({
        gift_idea: itemData.gift_idea,
        price: itemData.price ? Number(itemData.price) : null,
        url: itemData.url
      }).eq('id', itemData.id);
      if (error) throw error;
    } else { // Create new item
      const { error } = await supabase.from('gift_items').insert({
        list_id: listId,
        gift_idea: itemData.gift_idea,
        price: itemData.price ? Number(itemData.price) : null,
        url: itemData.url
      });
      if (error) throw error;
    }
    fetchItems(); // Refetch all items to get the latest data
  };

  return { items, loadingItems: loading, refetchItems: fetchItems, deleteItem, saveItem };
}

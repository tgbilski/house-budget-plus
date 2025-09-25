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
    if (!user || !currentHousehold) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gift_lists')
        .select('*')
        .eq('user_id', user.id)
        .eq('household_id', currentHousehold.id)
        .eq('year', selectedYear)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setGiftLists(data || []);
      if (data && data.length > 0 && !selectedList) {
        setSelectedList(data[0]);
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

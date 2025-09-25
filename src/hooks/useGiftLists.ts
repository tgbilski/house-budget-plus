// src/hooks/useGiftItems.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GiftItemData {
  id: string;
  list_id: string;
  gift_idea: string;
  price: number;
  url: string;
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

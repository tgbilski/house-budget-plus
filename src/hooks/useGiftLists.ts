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
  event_date?: string | null;
  one_week_alert_dismissed?: boolean;
  created_at: string;
  updated_at: string;
}

export type GiftStatus = 'idea' | 'purchased' | 'wrapped' | 'delivered';
export type GiftPriority = 'must_have' | 'nice_to_have' | 'backup';

export const GIFT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Toys & Games',
  'Books',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Jewelry',
  'Gift Cards',
  'Experiences',
  'Handmade',
  'Other'
] as const;

export interface GiftItemData {
  id: string;
  list_id: string;
  gift_idea: string;
  price: number;
  url: string;
  status: GiftStatus;
  priority: GiftPriority;
  notes: string | null;
  category: string | null;
  quantity: number;
  quantity_purchased: number;
  purchased_at: string | null;
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
    // For non-authenticated users, provide demo data
    if (!user || !currentHousehold) {
      setLoading(false);
      const demoLists: GiftListData[] = [
        {
          id: 'demo-1',
          list_title: 'Holiday Gifts',
          user_id: 'demo',
          household_id: 'demo',
          year: selectedYear,
          budget_target: 500,
          event_date: null,
          one_week_alert_dismissed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-2',
          list_title: 'Birthday Gifts',
          user_id: 'demo',
          household_id: 'demo',
          year: selectedYear,
          budget_target: 300,
          event_date: null,
          one_week_alert_dismissed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-3',
          list_title: 'Anniversary Gifts',
          user_id: 'demo',
          household_id: 'demo',
          year: selectedYear,
          budget_target: 200,
          event_date: null,
          one_week_alert_dismissed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-4',
          list_title: 'Wedding Gifts',
          user_id: 'demo',
          household_id: 'demo',
          year: selectedYear,
          budget_target: 400,
          event_date: null,
          one_week_alert_dismissed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setGiftLists(demoLists);
      if (!selectedList) {
        setSelectedList(demoLists[0]);
      }
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
  }, [user, currentHousehold, selectedYear]);

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

  const updateEventDate = async (listId: string, eventDate: Date | null) => {
    if (!user || listId.startsWith('demo-')) return;
    
    try {
      const { error } = await supabase
        .from('gift_lists')
        .update({ 
          event_date: eventDate ? eventDate.toISOString().split('T')[0] : null,
          one_week_alert_dismissed: false // Reset alert when date changes
        })
        .eq('id', listId);
      
      if (error) throw error;
      
      // Update local state
      setGiftLists(prev => prev.map(list => 
        list.id === listId 
          ? { ...list, event_date: eventDate ? eventDate.toISOString().split('T')[0] : null, one_week_alert_dismissed: false }
          : list
      ));
      
      if (selectedList?.id === listId) {
        setSelectedList(prev => prev ? { 
          ...prev, 
          event_date: eventDate ? eventDate.toISOString().split('T')[0] : null,
          one_week_alert_dismissed: false 
        } : null);
      }
    } catch (error) {
      console.error('Error updating event date:', error);
    }
  };

  const dismissOneWeekAlert = async (listId: string) => {
    if (!user || listId.startsWith('demo-')) return;
    
    try {
      const { error } = await supabase
        .from('gift_lists')
        .update({ one_week_alert_dismissed: true })
        .eq('id', listId);
      
      if (error) throw error;
      
      // Update local state
      setGiftLists(prev => prev.map(list => 
        list.id === listId 
          ? { ...list, one_week_alert_dismissed: true }
          : list
      ));
      
      if (selectedList?.id === listId) {
        setSelectedList(prev => prev ? { ...prev, one_week_alert_dismissed: true } : null);
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
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
    loadGiftLists,
    updateEventDate,
    dismissOneWeekAlert
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
    
    // Provide demo data for demo lists
    if (listId.startsWith('demo-')) {
      setLoading(true);
      const demoItems: GiftItemData[] = [
        {
          id: 'demo-item-1',
          list_id: listId,
          gift_idea: 'Nice sweater',
          price: 45,
          url: 'https://example.com/sweater',
          status: 'purchased',
          priority: 'must_have',
          notes: 'Size Medium, Blue color preferred',
          category: 'Clothing',
          quantity: 1,
          quantity_purchased: 1,
          purchased_at: new Date().toISOString()
        },
        {
          id: 'demo-item-2',
          list_id: listId,
          gift_idea: 'Coffee mug set',
          price: 25,
          url: 'https://example.com/mugs',
          status: 'idea',
          priority: 'nice_to_have',
          notes: null,
          category: 'Home & Kitchen',
          quantity: 2,
          quantity_purchased: 0,
          purchased_at: null
        },
        {
          id: 'demo-item-3',
          list_id: listId,
          gift_idea: 'Wireless headphones',
          price: 79,
          url: 'https://example.com/headphones',
          status: 'wrapped',
          priority: 'must_have',
          notes: 'Black color',
          category: 'Electronics',
          quantity: 1,
          quantity_purchased: 1,
          purchased_at: new Date().toISOString()
        }
      ];
      setTimeout(() => {
        setItems(demoItems);
        setLoading(false);
      }, 300);
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
      
      // Map data with defaults for new fields
      const mappedItems: GiftItemData[] = (data || []).map(item => ({
        id: item.id,
        list_id: item.list_id,
        gift_idea: item.gift_idea || '',
        price: item.price || 0,
        url: item.url || '',
        status: (item.status as GiftStatus) || 'idea',
        priority: (item.priority as GiftPriority) || 'nice_to_have',
        notes: item.notes || null,
        category: item.category || null,
        quantity: item.quantity || 1,
        quantity_purchased: item.quantity_purchased || 0,
        purchased_at: item.purchased_at || null
      }));
      
      setItems(mappedItems);
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
    // For demo mode, just update the UI
    if (itemId.startsWith('demo-')) {
      setItems(prev => prev.filter(item => item.id !== itemId));
      return;
    }
    
    setItems(prev => prev.filter(item => item.id !== itemId));
    const { error } = await supabase.from('gift_items').delete().eq('id', itemId);
    if (error) {
      console.error('Failed to delete item, reverting UI:', error);
      fetchItems();
    }
  };

  const saveItem = async (itemData: Partial<GiftItemData>) => {
    if (!listId) return;

    // For demo mode, just update the UI
    if (listId.startsWith('demo-')) {
      if (itemData.id) {
        setItems(prev => prev.map(item => 
          item.id === itemData.id 
            ? { ...item, ...itemData } as GiftItemData
            : item
        ));
      } else {
        const newItem: GiftItemData = {
          id: `demo-item-${Date.now()}`,
          list_id: listId,
          gift_idea: itemData.gift_idea || '',
          price: itemData.price || 0,
          url: itemData.url || '',
          status: itemData.status || 'idea',
          priority: itemData.priority || 'nice_to_have',
          notes: itemData.notes || null,
          category: itemData.category || null,
          quantity: itemData.quantity || 1,
          quantity_purchased: itemData.quantity_purchased || 0,
          purchased_at: itemData.purchased_at || null
        };
        setItems(prev => [...prev, newItem]);
      }
      return;
    }

    const updateData = {
      gift_idea: itemData.gift_idea,
      price: itemData.price ? Number(itemData.price) : null,
      url: itemData.url,
      status: itemData.status || 'idea',
      priority: itemData.priority || 'nice_to_have',
      notes: itemData.notes || null,
      category: itemData.category || null,
      quantity: itemData.quantity || 1,
      quantity_purchased: itemData.quantity_purchased || 0,
      purchased_at: itemData.purchased_at || null
    };

    if (itemData.id) {
      const { error } = await supabase
        .from('gift_items')
        .update(updateData)
        .eq('id', itemData.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('gift_items')
        .insert({ ...updateData, list_id: listId });
      if (error) throw error;
    }
    fetchItems();
  };

  const updateItemStatus = async (itemId: string, status: GiftStatus) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const updates: Partial<GiftItemData> = { 
      ...item, 
      status,
      purchased_at: status === 'purchased' && !item.purchased_at ? new Date().toISOString() : item.purchased_at,
      quantity_purchased: status !== 'idea' ? item.quantity : item.quantity_purchased
    };
    
    await saveItem(updates);
  };

  return { 
    items, 
    loadingItems: loading, 
    refetchItems: fetchItems, 
    deleteItem, 
    saveItem,
    updateItemStatus 
  };
}

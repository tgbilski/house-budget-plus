// src/components/GiftCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useGiftItems, GiftItemData } from '@/hooks/useGiftLists';
import { GiftItem } from './GiftItem';

interface GiftListData {
  id?: string;
  list_title: string;
  budget_target?: number;
}

interface GiftCardProps {
  initialData?: GiftListData;
}

export function GiftCard({ initialData }: GiftCardProps) {
  const { user } = useAuth();
  const [listData, setListData] = useState<GiftListData>({ ...initialData });
  const [showNewItem, setShowNewItem] = useState(false);
  
  const { items, deleteItem, saveItem, refetchItems } = useGiftItems(listData.id);

  useEffect(() => {
    if (initialData) {
      setListData({ ...initialData });
      setShowNewItem(false);
    }
  }, [initialData]);

  const saveBudgetTarget = async (budgetTarget: number) => {
    if (!user || !listData.id) return;
    try {
      const { error } = await supabase
        .from('gift_lists').update({ budget_target: budgetTarget }).eq('id', listData.id);
      if (error) throw error;
      setListData(prev => ({ ...prev, budget_target: budgetTarget }));
    } catch (error) {
      console.error('Error saving budget target:', error);
    }
  };

  const handleSaveNewItem = async (itemData: Partial<GiftItemData>) => {
    await saveItem(itemData);
    setShowNewItem(false);
  };

  const totalSpent = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const budgetTarget = listData.budget_target || 0;
  // ... (Budget calculation logic is the same)
  
  return (
    <Card className="w-full bg-white border-gray-200 text-gray-900 shadow-lg h-fit">
      <CardHeader className="pb-3">
        <h2 className="text-lg font-bold text-gray-900 leading-tight">{listData.list_title}</h2>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* ... (Your Budget Tracking JSX is the same) ... */}
        
        {/* KEY FIX: We only map over items if the listData.id exists. */}
        {listData.id && items.map((item) => (
          <GiftItem
            key={item.id}
            item={item}
            onSave={saveItem}
            onDelete={deleteItem}
          />
        ))}

        {showNewItem && listData.id && (
          <GiftItem
            // Provide a blank item structure for the "new" form
            item={{ id: undefined, gift_idea: '', price: 0, url: '', list_id: listData.id }}
            onSave={handleSaveNewItem}
            onDelete={() => {}} // Not used for new items
            isNew={true}
            onCancel={() => setShowNewItem(false)} // Add a cancel handler
          />
        )}

        {listData.id && !showNewItem && (
          <Button onClick={() => setShowNewItem(true)} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Add Gift Idea
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// src/components/GiftCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, DollarSign, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useGiftItems, GiftItemData } from '@/hooks/useGiftLists';
import { GiftItem } from './GiftItem';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GiftListData {
  id?: string;
  list_title: string;
  budget_target?: number;
}

interface GiftCardProps {
  initialData?: GiftListData;
  onItemsChange?: () => void;
}

export function GiftCard({ initialData, onItemsChange }: GiftCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
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
    onItemsChange?.();
  };

  const handleSaveItem = async (itemData: Partial<GiftItemData>) => {
    await saveItem(itemData);
    onItemsChange?.();
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteItem(itemId);
    onItemsChange?.();
  };

  const handleResetList = async () => {
    if (!user || !listData.id) return;
    
    // Skip deletion for demo mode
    if (listData.id.startsWith('demo-')) {
      toast({
        title: "Demo Mode",
        description: "Sign in to reset your gift lists permanently.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('gift_items')
        .delete()
        .eq('list_id', listData.id);
      
      if (error) throw error;
      
      await refetchItems();
      onItemsChange?.();
      toast({
        title: "List Reset",
        description: "All gift ideas have been removed from this list.",
      });
    } catch (error) {
      console.error('Error resetting list:', error);
      toast({
        title: "Error",
        description: "Failed to reset the list. Please try again.",
        variant: "destructive",
      });
    }
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
        
        {/* Reset button - hide for demo lists */}
        {listData.id && !listData.id.startsWith('demo-') && items.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" /> Reset List
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Gift List?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all gift ideas from "{listData.list_title}". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetList} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Reset List
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        {/* KEY FIX: We only map over items if the listData.id exists. */}
        {listData.id && items.map((item) => (
          <GiftItem
            key={item.id}
            item={item}
            onSave={handleSaveItem}
            onDelete={handleDeleteItem}
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

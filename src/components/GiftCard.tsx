import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Edit2, Check, Trash2, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GiftItem } from './GiftItem';

interface GiftListData {
  id?: string;
  list_title: string;
  budget_target?: number;
}

interface GiftItemData {
  id: string;
  list_id: string;
  gift_idea: string;
  price: number;
  url: string;
}

interface GiftCardProps {
  initialData?: GiftListData;
  onDelete?: (id: string) => void;
  onSave?: () => void;
}

export function GiftCard({ initialData, onDelete, onSave }: GiftCardProps) {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { toast } = useToast();
  const [isEditingTitle, setIsEditingTitle] = useState(!initialData?.id);
  const [listData, setListData] = useState<GiftListData>({
    list_title: initialData?.list_title || 'Holiday Gifts',
    ...initialData
  });
  const [giftItems, setGiftItems] = useState<GiftItemData[]>([]);
  const [showNewItem, setShowNewItem] = useState(false);

  useEffect(() => {
    if (listData.id) {
      loadGiftItems();
    }
  }, [listData.id]);

  useEffect(() => {
    const handleAutofill = (event: CustomEvent) => {
      const { list_title, gift_idea, price, url } = event.detail;
      if (list_title) {
        setListData(prev => ({ ...prev, list_title }));
      }
      // For gift items, we'll add to the newest item or create a new one
      if (gift_idea || price || url) {
        setShowNewItem(true);
      }
    };

    window.addEventListener('giftAutofill' as any, handleAutofill);
    return () => window.removeEventListener('giftAutofill' as any, handleAutofill);
  }, []);

  const loadGiftItems = async () => {
    if (!listData.id) return;

    try {
      const { data, error } = await supabase
        .from('gift_items')
        .select('*')
        .eq('list_id', listData.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGiftItems(data || []);
    } catch (error) {
      console.error('Error loading gift items:', error);
    }
  };

  const saveBudgetTarget = async (budgetTarget: number) => {
    if (!user || !listData.id) return;

    try {
      const { error } = await supabase
        .from('gift_lists')
        .update({ budget_target: budgetTarget })
        .eq('id', listData.id);

      if (error) throw error;
      setListData(prev => ({ ...prev, budget_target: budgetTarget }));
    } catch (error) {
      console.error('Error saving budget target:', error);
    }
  };

  const saveListTitle = async () => {
    if (!user) return;

    try {
      if (listData.id) {
        // Update existing
        const { error } = await supabase
          .from('gift_lists')
          .update({
            list_title: listData.list_title,
            budget_target: listData.budget_target || 0
          })
          .eq('id', listData.id);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('gift_lists')
          .insert({
            user_id: user.id,
            household_id: currentHousehold?.id,
            list_title: listData.list_title,
            budget_target: listData.budget_target || 0
          })
          .select()
          .single();

        if (error) throw error;
        setListData(prev => ({ ...prev, id: data.id }));
        
        // Award badge when user creates their first gift list
        window.dispatchEvent(new CustomEvent('earnBadge', { detail: { badgeType: 'gifts' } }));
      }

      setIsEditingTitle(false);
      onSave?.();
      toast({
        title: "List saved",
        description: "Your gift list has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving list:', error);
      toast({
        title: "Error",
        description: "Failed to save gift list. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteList = async () => {
    if (!listData.id) return;

    try {
      // Delete all gift items first
      const { error: itemsError } = await supabase
        .from('gift_items')
        .delete()
        .eq('list_id', listData.id);

      if (itemsError) throw itemsError;

      // Then delete the list
      const { error } = await supabase
        .from('gift_lists')
        .delete()
        .eq('id', listData.id);

      if (error) throw error;

      onDelete?.(listData.id);
      toast({
        title: "List deleted",
        description: "The gift list has been removed.",
      });
    } catch (error) {
      console.error('Error deleting list:', error);
      toast({
        title: "Error",
        description: "Failed to delete gift list. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setGiftItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleTitleChange = (value: string) => {
    setListData(prev => ({ ...prev, list_title: value }));
  };

  // Calculate total from all gift items
  const totalSpent = giftItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const budgetTarget = listData.budget_target || 0;
  const isOverBudget = budgetTarget > 0 && totalSpent > budgetTarget;
  const isUnderBudget = budgetTarget > 0 && totalSpent <= budgetTarget;

  return (
    <Card className="w-full bg-white border-gray-200 text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        {/* Prominent title section */}
        <div className="space-y-3">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={listData.list_title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-xl font-bold bg-white border-2 border-primary text-gray-900 h-12"
                placeholder="Enter gift list title..."
                autoFocus
              />
              <Button
                size="sm"
                onClick={saveListTitle}
                className="h-10 px-3"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                  {listData.list_title}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Click to edit
                  </div>
                  <Edit2 className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        {listData.id && (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDeleteList}
              className="text-destructive hover:text-destructive hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete List
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Budget tracking section */}
        {listData.id && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-600" />
              <Label className="text-sm font-medium text-gray-700">Budget Tracking</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget-target" className="text-xs text-gray-600">
                  Target Budget
                </Label>
                <Input
                  id="budget-target"
                  type="number"
                  step="0.01"
                  value={listData.budget_target || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setListData(prev => ({ ...prev, budget_target: value }));
                  }}
                  onBlur={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    saveBudgetTarget(value);
                  }}
                  placeholder="0.00"
                  className="h-8 bg-white border-gray-300 text-gray-900"
                />
              </div>
              
              <div>
                <Label className="text-xs text-gray-600">Current Total</Label>
                <div 
                  className={`text-lg font-semibold p-2 rounded ${
                    isOverBudget 
                      ? 'text-red-600 bg-red-50' 
                      : isUnderBudget 
                        ? 'text-green-600 bg-green-50' 
                        : 'text-gray-900 bg-gray-100'
                  }`}
                >
                  ${totalSpent.toFixed(2)}
                  {budgetTarget > 0 && (
                    <span className="text-xs text-gray-500 ml-2">
                      / ${budgetTarget.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Existing gift items */}
        {giftItems.map((item) => (
          <GiftItem
            key={item.id}
            item={item}
            listId={listData.id!}
            onSave={loadGiftItems}
            onDelete={handleDeleteItem}
          />
        ))}

        {/* New gift item form */}
        {showNewItem && listData.id && (
          <GiftItem
            listId={listData.id}
            onSave={() => {
              setShowNewItem(false);
              loadGiftItems();
            }}
            isNew
          />
        )}

        {/* Add new item button */}
        {listData.id && !showNewItem && (
          <Button
            onClick={() => setShowNewItem(true)}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Gift Idea
          </Button>
        )}

        {/* Save list button (for new lists) */}
        {!listData.id && (
          <Button onClick={saveListTitle} className="w-full">
            Create Gift List
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

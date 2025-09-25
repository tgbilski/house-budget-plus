// src/components/GiftCard.tsx (Updated)
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGiftItems } from '@/hooks/useGiftItems';
import { GiftItem } from './GiftItem';

// Interfaces for the component's data
interface GiftListData {
  id?: string;
  list_title: string;
  budget_target?: number;
}

interface GiftCardProps {
  initialData?: GiftListData;
  onSave?: () => void;
}

export function GiftCard({ initialData, onSave }: GiftCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listData, setListData] = useState<GiftListData>({ ...initialData });
  const [showNewItem, setShowNewItem] = useState(false);

  // Use our custom hook to manage the gift items
  const { items, refetchItems, deleteItem } = useGiftItems(listData.id);

  useEffect(() => {
    if (initialData) {
      setListData({ ...initialData });
      setShowNewItem(false);
    }
  }, [initialData]);

  // Function to save only the budget target
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

  const totalSpent = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const budgetTarget = listData.budget_target || 0;
  const isOverBudget = budgetTarget > 0 && totalSpent > budgetTarget;
  const isUnderBudget = budgetTarget > 0 && totalSpent <= budgetTarget;

  return (
    <Card className="w-full bg-white border-gray-200 text-gray-900 shadow-lg">
      <CardHeader className="pb-4">
        {/* The title is now just a simple, non-editable header. No hover effects or edit buttons. */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {listData.list_title}
        </h2>
        {/* The delete button that was here has been completely removed. */}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Budget tracking section (no changes here) */}
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

        {/* Gift item list (no changes here) */}
        {items.map((item) => (
          <GiftItem
            key={item.id}
            item={item}
            listId={listData.id!}
            onSave={refetchItems}
            onDelete={() => deleteItem(item.id)}
          />
        ))}

        {showNewItem && listData.id && (
          <GiftItem
            listId={listData.id}
            onSave={() => {
              setShowNewItem(false);
              refetchItems();
            }}
            isNew
          />
        )}

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
      </CardContent>
    </Card>
  );
}

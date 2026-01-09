// src/components/GiftCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Plus, DollarSign, Trash2, Gift, ShoppingCart, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useGiftItems, GiftItemData, GiftStatus } from '@/hooks/useGiftLists';
import { GiftItem } from './GiftItem';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

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
  const [orderedItems, setOrderedItems] = useState<GiftItemData[]>([]);
  
  const { items, deleteItem, saveItem, refetchItems, updateItemStatus } = useGiftItems(listData.id);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (initialData) {
      setListData({ ...initialData });
      setShowNewItem(false);
    }
  }, [initialData]);

  // Sync ordered items when items change from database
  useEffect(() => {
    setOrderedItems(items);
  }, [items]);

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

  const handleStatusChange = async (itemId: string, status: GiftStatus) => {
    await updateItemStatus(itemId, status);
    onItemsChange?.();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setOrderedItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleResetList = async () => {
    if (!user || !listData.id) return;
    
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

  // Calculate statistics
  const totalItems = items.length;
  const totalSpent = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const budgetTarget = listData.budget_target || 0;
  const budgetProgress = budgetTarget > 0 ? Math.min((totalSpent / budgetTarget) * 100, 100) : 0;
  
  // Status breakdown
  const statusCounts = items.reduce((acc, item) => {
    const status = item.status || 'idea';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const completedItems = (statusCounts['purchased'] || 0) + (statusCounts['wrapped'] || 0);
  const completionProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  
  return (
    <Card className="w-full bg-card h-fit">
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground leading-tight">{listData.list_title}</h2>
          <span className="text-sm text-muted-foreground">{totalItems} gifts</span>
        </div>
        
        {/* Progress Overview */}
        <div className="space-y-3">
          {/* Completion Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Shopping Progress</span>
              <span className="font-medium">{completedItems}/{totalItems} completed</span>
            </div>
            <Progress value={completionProgress} className="h-2" />
          </div>
          
          {/* Status Breakdown */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-amber-500">
              <Gift className="h-3.5 w-3.5" />
              <span>{statusCounts['idea'] || 0} ideas</span>
            </div>
            <div className="flex items-center gap-1 text-blue-500">
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>{statusCounts['purchased'] || 0} purchased</span>
            </div>
            <div className="flex items-center gap-1 text-purple-500">
              <Package className="h-3.5 w-3.5" />
              <span>{statusCounts['wrapped'] || 0} wrapped</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Budget Tracking */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="budget" className="text-sm font-medium flex items-center gap-1">
              <DollarSign className="h-4 w-4" /> Budget Target
            </Label>
            <Input 
              id="budget"
              type="number"
              step="0.01"
              value={listData.budget_target || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setListData(prev => ({ ...prev, budget_target: value }));
              }}
              onBlur={(e) => saveBudgetTarget(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="w-24 h-8 text-right"
            />
          </div>
          
          {budgetTarget > 0 && (
            <div className="space-y-1">
              <Progress 
                value={budgetProgress} 
                className={cn(
                  "h-2",
                  budgetProgress > 100 && "[&>div]:bg-red-500"
                )} 
              />
              <div className="flex justify-between text-xs">
                <span className={cn(
                  totalSpent > budgetTarget ? "text-red-600 font-medium" : "text-muted-foreground"
                )}>
                  ${totalSpent.toFixed(2)} spent
                </span>
                <span className="text-muted-foreground">
                  ${Math.max(budgetTarget - totalSpent, 0).toFixed(2)} remaining
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Gift Items */}
        <div className="space-y-2">
          {listData.id && orderedItems.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedItems.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {orderedItems.map((item, index) => (
                  <GiftItem
                    key={item.id}
                    item={item}
                    itemNumber={index + 1}
                    onSave={handleSaveItem}
                    onDelete={handleDeleteItem}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}

          {showNewItem && listData.id && (
            <GiftItem
              item={{ 
                id: undefined, 
                gift_idea: '', 
                price: 0, 
                url: '', 
                list_id: listData.id,
                status: 'idea',
                priority: 'nice_to_have',
                quantity: 1,
                quantity_purchased: 0,
                notes: null,
                category: null,
                purchased_at: null
              }}
              itemNumber={orderedItems.length + 1}
              onSave={handleSaveNewItem}
              onDelete={() => {}}
              isNew={true}
              onCancel={() => setShowNewItem(false)}
            />
          )}

          {listData.id && !showNewItem && (
            <Button onClick={() => setShowNewItem(true)} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Gift Idea
            </Button>
          )}
          
          {/* Reset button - moved below Add Gift Idea */}
          {listData.id && !listData.id.startsWith('demo-') && items.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-destructive">
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
        </div>
      </CardContent>
    </Card>
  );
}

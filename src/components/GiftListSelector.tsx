// src/components/GiftListSelector.tsx (Updated with CSS Fixes)
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Gift, Edit3, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/hooks/useCurrency';

// ... (Interfaces and Props definitions remain the same)
interface GiftListData {
  id: string;
  list_title: string;
  year: number;
}

interface GiftListSelectorProps {
  giftLists: GiftListData[];
  selectedList: GiftListData | null;
  editingListId: string | null;
  editingTitle: string;
  onSelectList: (list: GiftListData) => void;
  onStartEditing: (listId: string, currentTitle: string) => void;
  onSaveTitle: () => void;
  onCancelEditing: () => void;
  onSetEditingTitle: (title: string) => void;
}


export function GiftListSelector({
  giftLists,
  selectedList,
  editingListId,
  editingTitle,
  onSelectList,
  onStartEditing,
  onSaveTitle,
  onCancelEditing,
  onSetEditingTitle,
}: GiftListSelectorProps) {
  const { currency } = useCurrency();
  const [listTotals, setListTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchTotals = async () => {
      const totals: Record<string, number> = {};
      
      for (const list of giftLists) {
        // Skip demo lists
        if (list.id.startsWith('demo-')) {
          totals[list.id] = 70; // Demo total
          continue;
        }
        
        const { data, error } = await supabase
          .from('gift_items')
          .select('price')
          .eq('list_id', list.id);
        
        if (!error && data) {
          totals[list.id] = data.reduce((sum, item) => sum + (item.price || 0), 0);
        } else {
          totals[list.id] = 0;
        }
      }
      
      setListTotals(totals);
    };
    
    if (giftLists.length > 0) {
      fetchTotals();
    }
  }, [giftLists]);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-2">
          {giftLists.map((list) => (
            <div key={list.id} className="w-full">
              <div
                className={cn(
                  "group relative cursor-pointer transition-all w-full",
                  selectedList?.id === list.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80",
                  "rounded-lg px-4 py-3 border-2",
                  selectedList?.id === list.id && "border-primary",
                  "flex items-center justify-between"
                )}
                onClick={() => onSelectList(list)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Gift className="h-5 w-5 flex-shrink-0" />
                  {editingListId === list.id ? (
                    <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editingTitle}
                        onChange={(e) => onSetEditingTitle(e.target.value)}
                        // FIX #2: Force input text to be your primary (dark blue) color
                        className="h-8 text-sm text-primary bg-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onSaveTitle();
                          if (e.key === 'Escape') onCancelEditing();
                        }}
                        autoFocus
                      />
                      <Button size="sm" onClick={() => onSaveTitle()}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onCancelEditing}
                        // FIX #3: Force button background to white and icon to primary (dark blue) color
                        className="bg-white text-primary hover:bg-gray-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">{list.list_title}</span>
                      <Badge variant="secondary" className="ml-2">{list.year}</Badge>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-lg font-bold",
                    selectedList?.id === list.id ? "text-primary-foreground" : "text-teal"
                  )}>
                    {currency.symbol}{(listTotals[list.id] || 0).toFixed(2)}
                  </span>
                </div>
                {editingListId !== list.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onStartEditing(list.id, list.list_title); }}
                    className={cn(
                      "h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                      // FIX #1: When selected, make icon dark blue on hover over white background
                      selectedList?.id === list.id && "text-primary-foreground hover:bg-white hover:text-primary"
                    )}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

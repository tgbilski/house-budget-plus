import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, ExternalLink, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GiftItemData {
  id?: string;
  list_id: string;
  gift_idea: string;
  price: number | string;
  url: string;
}

interface GiftItemProps {
  item?: GiftItemData;
  listId: string;
  onSave?: () => void;
  onDelete?: (id: string) => void;
  isNew?: boolean;
}

export function GiftItem({ item, listId, onSave, onDelete, isNew = false }: GiftItemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [itemData, setItemData] = useState<GiftItemData>({
    list_id: listId,
    gift_idea: item?.gift_idea || '',
    price: item?.price || '',
    url: item?.url || '',
    ...item
  });

  const saveItem = async () => {
    if (!user) return;

    try {
      if (itemData.id) {
        // Update existing
        const { error } = await supabase
          .from('gift_items')
          .update({
            gift_idea: itemData.gift_idea,
            price: itemData.price ? Number(itemData.price) : null,
            url: itemData.url
          })
          .eq('id', itemData.id);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('gift_items')
          .insert({
            list_id: listId,
            gift_idea: itemData.gift_idea,
            price: itemData.price ? Number(itemData.price) : null,
            url: itemData.url
          })
          .select()
          .single();

        if (error) throw error;
        setItemData(prev => ({ ...prev, id: data.id }));
      }

      onSave?.();
      toast({
        title: "Gift item saved",
        description: "Your gift idea has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving gift item:', error);
      toast({
        title: "Error",
        description: "Failed to save gift item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!itemData.id) return;

    try {
      const { error } = await supabase
        .from('gift_items')
        .delete()
        .eq('id', itemData.id);

      if (error) throw error;

      onDelete?.(itemData.id);
      toast({
        title: "Gift item deleted",
        description: "The gift item has been removed.",
      });
    } catch (error) {
      console.error('Error deleting gift item:', error);
      toast({
        title: "Error",
        description: "Failed to delete gift item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof GiftItemData, value: string | number) => {
    setItemData(prev => ({ ...prev, [field]: value }));
  };

  const openUrl = () => {
    if (itemData.url) {
      const url = itemData.url.startsWith('http') ? itemData.url : `https://${itemData.url}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-3">
          <div>
            <Label htmlFor={`gift-idea-${itemData.id || 'new'}`}>Gift Idea</Label>
            <Textarea
              id={`gift-idea-${itemData.id || 'new'}`}
              value={itemData.gift_idea}
              onChange={(e) => handleInputChange('gift_idea', e.target.value)}
              placeholder="Enter a gift idea..."
              rows={2}
              className="text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor={`price-${itemData.id || 'new'}`}>Price</Label>
              <Input
                id={`price-${itemData.id || 'new'}`}
                type="number"
                step="0.01"
                value={itemData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0.00"
                className="w-full text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor={`url-${itemData.id || 'new'}`}>URL (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id={`url-${itemData.id || 'new'}`}
                  value={itemData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 min-w-0 text-gray-900 dark:text-white"
                />
                {itemData.url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={openUrl}
                    className="shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {itemData.id && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive ml-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={saveItem} size="sm">
          Save Gift
        </Button>
      </div>
    </div>
  );
}
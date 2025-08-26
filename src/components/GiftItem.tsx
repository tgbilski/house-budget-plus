import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, ExternalLink, Edit2 } from 'lucide-react';
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
  
  // Check if this is a new/empty item to start in editing mode
  const isEmpty = !item?.gift_idea && !item?.price && !item?.url;
  const [isEditing, setIsEditing] = useState(isNew || isEmpty);
  
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

      setIsEditing(false);
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

  const handleCardClick = () => {
    if (!isEditing && itemData.url) {
      openUrl();
    }
  };

  if (isEditing) {
    return (
      <div className="border border-gray-600 rounded-lg p-4 space-y-3 bg-gray-800/50">
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-3">
            <div>
              <Label htmlFor={`gift-idea-${itemData.id || 'new'}`} className="text-gray-300">Gift Idea</Label>
              <Textarea
                id={`gift-idea-${itemData.id || 'new'}`}
                value={itemData.gift_idea}
                onChange={(e) => handleInputChange('gift_idea', e.target.value)}
                placeholder="Enter a gift idea..."
                rows={2}
                className="text-white bg-gray-700 border-gray-600"
              />
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor={`price-${itemData.id || 'new'}`} className="text-gray-300">Price</Label>
                <Input
                  id={`price-${itemData.id || 'new'}`}
                  type="number"
                  step="0.01"
                  value={itemData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  className="w-full text-white bg-gray-700 border-gray-600"
                />
              </div>

              <div>
                <Label htmlFor={`url-${itemData.id || 'new'}`} className="text-gray-300">URL (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id={`url-${itemData.id || 'new'}`}
                    value={itemData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 min-w-0 text-white bg-gray-700 border-gray-600"
                  />
                  {itemData.url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={openUrl}
                      className="shrink-0 text-slate-800 hover:text-slate-900"
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
          {!isNew && (
          <Button 
            onClick={() => setIsEditing(false)} 
            variant="outline" 
            size="sm"
            className="text-slate-800 border-slate-300 hover:text-slate-900 hover:border-slate-400"
          >
              Cancel
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Summary view
  return (
    <div 
      className={`border border-gray-600 rounded-lg p-3 bg-gray-800/50 flex items-center justify-between group transition-colors ${
        itemData.url ? 'cursor-pointer hover:bg-gray-700/50' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate text-white">
              {itemData.gift_idea || 'Untitled Gift'}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {itemData.price && (
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  ${Number(itemData.price).toFixed(2)}
                </span>
              )}
              {itemData.url && (
                <div className="flex items-center gap-1 text-xs text-gray-300">
                  <ExternalLink className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">
                    {itemData.url.replace(/^https?:\/\//, '')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="h-8 w-8 p-0"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        {itemData.id && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
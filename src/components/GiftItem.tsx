// src/components/GiftItem.tsx
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, ExternalLink, Edit2, Save } from 'lucide-react';
import { GiftItemData } from '@/hooks/useGiftLists'; // Import the type
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GiftItemProps {
  item: Partial<GiftItemData>;
  onSave: (updatedItem: Partial<GiftItemData>) => Promise<void>;
  onDelete: (id: string) => void;
  isNew?: boolean;
  onCancel?: () => void;
}

export function GiftItem({ item, onSave, onDelete, isNew = false, onCancel }: GiftItemProps) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [itemData, setItemData] = useState(item);
  const [urlMetadata, setUrlMetadata] = useState<{title: string, image: string} | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    await onSave(itemData);
    if(!isNew) {
      setIsEditing(false);
    }
  };
  
  const handleDelete = () => {
    if(item.id) {
      onDelete(item.id);
    }
  };

  const handleCancel = () => {
    if (isNew && onCancel) {
      onCancel();
    } else {
      setItemData(item); // Revert changes
      setIsEditing(false);
    }
  };

  const handleInputChange = (field: keyof GiftItemData, value: string | number) => {
    setItemData(prev => ({ ...prev, [field]: value }));
  };

  // Fetch URL metadata when URL changes
  useEffect(() => {
    if (itemData.url && itemData.url.startsWith('http') && !isEditing) {
      fetchUrlMetadata(itemData.url);
    }
  }, [itemData.url, isEditing]);

  const fetchUrlMetadata = async (url: string) => {
    setLoadingMetadata(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-url-metadata', {
        body: { url }
      });

      if (error) {
        console.error('Error fetching URL metadata:', error);
        toast({
          title: "Unable to fetch URL",
          description: "The URL couldn't be loaded. Please check if it's valid and try again.",
          variant: "destructive",
        });
        setLoadingMetadata(false);
        return;
      }

      if (data?.error) {
        toast({
          title: "Invalid URL",
          description: "The URL returned an error. Please verify the link is correct.",
          variant: "destructive",
        });
        setLoadingMetadata(false);
        return;
      }

      if (data && (data.image || data.title)) {
        setUrlMetadata({ title: data.title, image: data.image });
      }
    } catch (error) {
      console.error('Error fetching URL metadata:', error);
    } finally {
      setLoadingMetadata(false);
    }
  };

  if (isEditing) {
    return (
      <div className="border border-gray-200 rounded-lg p-3 sm:p-2 space-y-3 sm:space-y-2 bg-gray-50">
        <div className="space-y-3 sm:space-y-2">
          <div>
            <Label htmlFor={`gift-idea-${item.id}`} className="text-sm sm:text-xs font-medium">Gift Idea</Label>
            <Input 
              id={`gift-idea-${item.id}`} 
              value={itemData.gift_idea || ''} 
              onChange={(e) => handleInputChange('gift_idea', e.target.value)} 
              placeholder="Gift idea..." 
              className="mt-1 text-base sm:text-xs h-10 sm:h-8"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
            <div>
              <Label htmlFor={`price-${item.id}`} className="text-sm sm:text-xs font-medium">Price ($)</Label>
              <Input 
                id={`price-${item.id}`} 
                type="number" 
                step="0.01"
                value={itemData.price || ''} 
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)} 
                placeholder="0.00" 
                className="mt-1 text-base sm:text-xs h-10 sm:h-8"
              />
            </div>
            <div>
              <Label htmlFor={`url-${item.id}`} className="text-sm sm:text-xs font-medium">Link</Label>
              <Input 
                id={`url-${item.id}`} 
                value={itemData.url || ''} 
                onChange={(e) => handleInputChange('url', e.target.value)} 
                placeholder="https://..." 
                className="mt-1 text-base sm:text-xs h-10 sm:h-8"
              />
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 sm:gap-1 pt-2 sm:pt-1">
          <Button onClick={handleSave} size="sm" className="flex-1 h-10 sm:h-7 text-sm sm:text-xs">
            <Save className="h-4 sm:h-3 w-4 sm:w-3 mr-1" /> Save
          </Button>
          <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1 h-10 sm:h-7 text-sm sm:text-xs">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-2 bg-white group shadow-sm">
      {/* Thumbnail image if available */}
      {urlMetadata?.image && (
        <div className="mb-2">
          <img 
            src={urlMetadata.image} 
            alt="Link preview" 
            className="w-full h-20 object-cover rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-xs text-gray-900 leading-tight">
            {itemData.gift_idea || 'Untitled Gift'}
          </h4>
          <div className="flex flex-col gap-1 mt-1 text-xs text-gray-500">
            {itemData.price ? (
              <span className="font-semibold text-green-600">
                ${Number(itemData.price).toFixed(2)}
              </span>
            ) : null}
            {itemData.url && (
              <a 
                href={itemData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 truncate text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                <ExternalLink className="h-3 w-3 flex-shrink-0" /> 
                <span className="truncate">
                  {urlMetadata?.title || 'Link'}
                </span>
              </a>
            )}
          </div>
        </div>
        
        {/* Action buttons - always visible on mobile, hover on desktop */}
        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsEditing(true)} 
            className="h-6 w-6 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          {item.id && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDelete} 
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

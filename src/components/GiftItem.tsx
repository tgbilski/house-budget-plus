// src/components/GiftItem.tsx
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, ExternalLink, Edit2, Save } from 'lucide-react';
import { GiftItemData } from '@/hooks/useGiftLists'; // Import the type

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

  if (isEditing) {
    return (
      <div className="border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3 bg-gray-50">
        <div className="space-y-3">
          <div>
            <Label htmlFor={`gift-idea-${item.id}`} className="text-sm font-medium">Gift Idea</Label>
            <Input 
              id={`gift-idea-${item.id}`} 
              value={itemData.gift_idea || ''} 
              onChange={(e) => handleInputChange('gift_idea', e.target.value)} 
              placeholder="A great gift idea..." 
              className="mt-1"
            />
          </div>
          
          {/* Mobile-first layout: stack on mobile, side-by-side on larger screens */}
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
            <div>
              <Label htmlFor={`price-${item.id}`} className="text-sm font-medium">Price ($)</Label>
              <Input 
                id={`price-${item.id}`} 
                type="number" 
                step="0.01"
                value={itemData.price || ''} 
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)} 
                placeholder="0.00" 
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`url-${item.id}`} className="text-sm font-medium">Website Link</Label>
              <Input 
                id={`url-${item.id}`} 
                value={itemData.url || ''} 
                onChange={(e) => handleInputChange('url', e.target.value)} 
                placeholder="https://example.com" 
                className="mt-1"
              />
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button onClick={handleSave} size="sm" className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
          <Button onClick={handleCancel} variant="outline" size="sm" className="w-full sm:w-auto">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white group shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm sm:text-base text-gray-900 leading-tight">
            {itemData.gift_idea || 'Untitled Gift'}
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
            {itemData.price ? (
              <span className="font-semibold text-green-600">
                ${Number(itemData.price).toFixed(2)}
              </span>
            ) : null}
            {itemData.url && (
              <div className="flex items-center gap-1 truncate">
                <ExternalLink className="h-3 w-3 flex-shrink-0" /> 
                <span className="truncate">Link available</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons - always visible on mobile, hover on desktop */}
        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsEditing(true)} 
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          {item.id && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDelete} 
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

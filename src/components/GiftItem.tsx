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
      <div className="border border-gray-200 rounded-lg p-2 space-y-2 bg-gray-50">
        <div className="space-y-2">
          <div>
            <Label htmlFor={`gift-idea-${item.id}`} className="text-xs font-medium">Gift Idea</Label>
            <Input 
              id={`gift-idea-${item.id}`} 
              value={itemData.gift_idea || ''} 
              onChange={(e) => handleInputChange('gift_idea', e.target.value)} 
              placeholder="Gift idea..." 
              className="mt-1 text-xs h-8"
            />
          </div>
          
          <div className="space-y-2">
            <div>
              <Label htmlFor={`price-${item.id}`} className="text-xs font-medium">Price ($)</Label>
              <Input 
                id={`price-${item.id}`} 
                type="number" 
                step="0.01"
                value={itemData.price || ''} 
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)} 
                placeholder="0.00" 
                className="mt-1 text-xs h-8"
              />
            </div>
            <div>
              <Label htmlFor={`url-${item.id}`} className="text-xs font-medium">Link</Label>
              <Input 
                id={`url-${item.id}`} 
                value={itemData.url || ''} 
                onChange={(e) => handleInputChange('url', e.target.value)} 
                placeholder="https://..." 
                className="mt-1 text-xs h-8"
              />
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-1 pt-1">
          <Button onClick={handleSave} size="sm" className="flex-1 h-7 text-xs">
            <Save className="h-3 w-3 mr-1" /> Save
          </Button>
          <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1 h-7 text-xs">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-2 bg-white group shadow-sm">
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
              <div className="flex items-center gap-1 truncate">
                <ExternalLink className="h-3 w-3 flex-shrink-0" /> 
                <span className="truncate">Link</span>
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

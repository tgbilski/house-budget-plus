// src/components/GiftItem.tsx (New Simplified Version)
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, ExternalLink, Edit2, Save } from 'lucide-react';

interface GiftItemData {
  id?: string;
  gift_idea: string;
  price: number | string;
  url: string;
}

interface GiftItemProps {
  item: GiftItemData; // Changed from optional to required
  onSave: (updatedItem: GiftItemData) => Promise<void>;
  onDelete: (id: string) => void;
  isNew?: boolean;
}

export function GiftItem({ item, onSave, onDelete, isNew = false }: GiftItemProps) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [itemData, setItemData] = useState<GiftItemData>(item);

  const handleSave = async () => {
    // Tell the parent component to save the changes
    await onSave(itemData);
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    // It only needs to call the onDelete prop with its ID
    if(item.id) {
      onDelete(item.id);
    }
  };

  const handleInputChange = (field: keyof GiftItemData, value: string | number) => {
    setItemData(prev => ({ ...prev, [field]: value }));
  };

  if (isEditing) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
        <div className="space-y-2">
          <div>
            <Label>Gift Idea</Label>
            <Input value={itemData.gift_idea} onChange={(e) => handleInputChange('gift_idea', e.target.value)} placeholder="A great gift idea..." />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Price</Label>
              <Input type="number" value={itemData.price} onChange={(e) => handleInputChange('price', e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label>URL</Label>
              <Input value={itemData.url} onChange={(e) => handleInputChange('url', e.target.value)} placeholder="https://example.com" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm"><Save className="h-4 w-4 mr-2" /> Save</Button>
          {!isNew && <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">Cancel</Button>}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white flex items-center justify-between group transition-colors shadow-sm">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate text-gray-900">{itemData.gift_idea || 'Untitled Gift'}</h4>
        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
          {itemData.price && <span className="font-semibold text-green-600">${Number(itemData.price).toFixed(2)}</span>}
          {itemData.url && <div className="flex items-center gap-1 truncate"><ExternalLink className="h-3 w-3" /> Link</div>}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="h-8 w-8 p-0"><Edit2 className="h-4 w-4" /></Button>
        {item.id && <Button size="sm" variant="ghost" onClick={handleDelete} className="h-8 w-8 p-0 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>}
      </div>
    </div>
  );
}

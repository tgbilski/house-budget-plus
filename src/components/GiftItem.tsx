// src/components/GiftItem.tsx
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Trash2, 
  ExternalLink, 
  Edit2, 
  Save, 
  ShoppingCart, 
  Gift, 
  Package, 
  Star,
  ChevronDown,
  StickyNote
} from 'lucide-react';
import { GiftItemData, GiftStatus, GiftPriority, GIFT_CATEGORIES } from '@/hooks/useGiftLists';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface GiftItemProps {
  item: Partial<GiftItemData>;
  itemNumber?: number;
  onSave: (updatedItem: Partial<GiftItemData>) => Promise<void>;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: GiftStatus) => Promise<void>;
  isNew?: boolean;
  onCancel?: () => void;
}

// Only 3 statuses now - removed "delivered"
const AVAILABLE_STATUSES: GiftStatus[] = ['idea', 'purchased', 'wrapped'];

const STATUS_CONFIG: Record<GiftStatus, { label: string; icon: React.ElementType; color: string; bgColor: string; activeColor: string }> = {
  idea: { label: 'Idea', icon: Gift, color: 'text-slate-400', bgColor: 'bg-slate-100', activeColor: 'text-amber-500' },
  purchased: { label: 'Purchased', icon: ShoppingCart, color: 'text-slate-400', bgColor: 'bg-blue-100', activeColor: 'text-blue-500' },
  wrapped: { label: 'Wrapped', icon: Package, color: 'text-slate-400', bgColor: 'bg-purple-100', activeColor: 'text-purple-500' },
  delivered: { label: 'Delivered', icon: Package, color: 'text-slate-400', bgColor: 'bg-green-100', activeColor: 'text-green-500' }
};

export function GiftItem({ item, itemNumber, onSave, onDelete, onStatusChange, isNew = false, onCancel }: GiftItemProps) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [isExpanded, setIsExpanded] = useState(false);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [itemData, setItemData] = useState<Partial<GiftItemData>>({
    ...item,
    status: item.status || 'idea',
    priority: item.priority || 'nice_to_have',
    quantity: item.quantity || 1,
    quantity_purchased: item.quantity_purchased || 0
  });
  const [urlMetadata, setUrlMetadata] = useState<{title: string, image: string} | null>(null);

  // Sync itemData when item prop changes (e.g., after status update)
  useEffect(() => {
    setItemData({
      ...item,
      status: item.status || 'idea',
      priority: item.priority || 'nice_to_have',
      quantity: item.quantity || 1,
      quantity_purchased: item.quantity_purchased || 0
    });
  }, [item]);

  const handleSave = async () => {
    await onSave(itemData);
    if(!isNew) setIsEditing(false);
  };
  
  const handleDelete = () => {
    if(item.id) onDelete(item.id);
  };

  const handleCancel = () => {
    if (isNew && onCancel) {
      onCancel();
    } else {
      setItemData({
        ...item,
        status: item.status || 'idea',
        priority: item.priority || 'nice_to_have',
        quantity: item.quantity || 1,
        quantity_purchased: item.quantity_purchased || 0
      });
      setIsEditing(false);
    }
  };

  const handleInputChange = (field: keyof GiftItemData, value: string | number | null) => {
    setItemData(prev => ({ ...prev, [field]: value }));
  };

  const handleStatusClick = async (newStatus: GiftStatus) => {
    setStatusPopoverOpen(false);
    if (item.id && onStatusChange) {
      await onStatusChange(item.id, newStatus);
    } else {
      setItemData(prev => ({ ...prev, status: newStatus }));
    }
  };

  useEffect(() => {
    if (itemData.url && itemData.url.startsWith('http') && !isEditing) {
      fetchUrlMetadata(itemData.url);
    }
  }, [itemData.url, isEditing]);

  const fetchUrlMetadata = async (url: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-url-metadata', {
        body: { url }
      });
      if (!error && data && (data.image || data.title)) {
        setUrlMetadata({ title: data.title, image: data.image });
      }
    } catch (error) {
      console.error('Error fetching URL metadata:', error);
    }
  };

  const currentStatus = (itemData.status as GiftStatus) || 'idea';
  const currentPriority = (itemData.priority as GiftPriority) || 'nice_to_have';
  const statusConfig = STATUS_CONFIG[currentStatus];
  const StatusIcon = statusConfig.icon;

  // Edit Mode
  if (isEditing) {
    return (
      <div className="border-2 border-primary/30 rounded-lg p-4 bg-muted/30">
        {/* Status Selector at Top */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-1 p-1 bg-background rounded-full border">
            {AVAILABLE_STATUSES.map((status) => {
              const config = STATUS_CONFIG[status];
              const Icon = config.icon;
              const isActive = (itemData.status || 'idea') === status;
              
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setItemData(prev => ({ ...prev, status }))}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    isActive 
                      ? cn(config.bgColor, config.activeColor) 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  title={config.label}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Gift Idea *</Label>
            <Input 
              value={itemData.gift_idea || ''} 
              onChange={(e) => handleInputChange('gift_idea', e.target.value)} 
              placeholder="What's the gift?" 
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">Price ($)</Label>
              <Input 
                type="number" 
                step="0.01"
                value={itemData.price || ''} 
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)} 
                placeholder="0.00" 
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <Select 
                value={itemData.category || ''} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {GIFT_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">Priority</Label>
              <Select 
                value={itemData.priority || 'nice_to_have'} 
                onValueChange={(value) => handleInputChange('priority', value as GiftPriority)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="must_have">Must Have</SelectItem>
                  <SelectItem value="nice_to_have">Nice to Have</SelectItem>
                  <SelectItem value="backup">Backup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Quantity</Label>
              <Input 
                type="number" 
                min="1"
                value={itemData.quantity || 1} 
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)} 
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Link (optional)</Label>
            <Input 
              value={itemData.url || ''} 
              onChange={(e) => handleInputChange('url', e.target.value)} 
              placeholder="https://..." 
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Notes</Label>
            <Textarea 
              value={itemData.notes || ''} 
              onChange={(e) => handleInputChange('notes', e.target.value)} 
              placeholder="Size, color, preferences..." 
              className="mt-1 min-h-[60px]"
            />
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSave} size="sm" className="flex-1">
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
          <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Display Mode - Clean Row Layout with Clickable Status
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border rounded-lg bg-card overflow-hidden">
        {/* Main Row - Stacked on mobile, row on desktop */}
        <div className="flex flex-col sm:flex-row sm:items-center p-3 gap-2 sm:gap-3">
          {/* Top row on mobile: Status + Name + Price */}
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 w-full">
            {/* Clickable Status Icon */}
            <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
              <PopoverTrigger asChild>
                <button 
                  className={cn(
                    "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                    "hover:ring-2 hover:ring-primary/30 cursor-pointer",
                    statusConfig.bgColor
                  )}
                  title={`Status: ${statusConfig.label} (click to change)`}
                >
                  <StatusIcon className={cn("h-4 w-4 sm:h-5 sm:w-5", statusConfig.activeColor)} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 bg-popover z-50" align="start">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground px-2 pb-1">Set status:</p>
                  {AVAILABLE_STATUSES.map((status) => {
                    const config = STATUS_CONFIG[status];
                    const Icon = config.icon;
                    const isActive = status === currentStatus;
                    
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusClick(status)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors w-full text-left",
                          isActive ? cn(config.bgColor, config.activeColor) : "hover:bg-muted"
                        )}
                      >
                        <Icon className={cn("h-4 w-4", isActive ? config.activeColor : "text-muted-foreground")} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Item Number */}
            {itemNumber && (
              <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                {itemNumber}
              </span>
            )}
            
            {/* Name & Category - Allow wrapping on mobile */}
            <div className="flex-1 min-w-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-start sm:items-center gap-1">
                      <span className="font-medium text-sm line-clamp-2 sm:truncate">
                        {itemData.gift_idea || 'Untitled Gift'}
                      </span>
                      {currentPriority === 'must_have' && (
                        <Star className="h-3 w-3 text-red-500 fill-red-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{itemData.gift_idea || 'Untitled Gift'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {itemData.category && (
                <span className="text-xs text-muted-foreground block">{itemData.category}</span>
              )}
            </div>
            
            {/* Price + Expand button */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="font-semibold text-sm text-green-600 whitespace-nowrap">
                {itemData.price ? `$${Number(itemData.price).toFixed(2)}` : '-'}
              </span>
              
              {/* Expand */}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </div>
        
        {/* Expanded */}
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3 border-t">
            {/* Notes */}
            {itemData.notes && (
              <div className="bg-muted rounded p-2 text-sm mt-3">
                <StickyNote className="h-3 w-3 inline mr-1 text-muted-foreground" />
                {itemData.notes}
              </div>
            )}
            
            {/* Link */}
            {itemData.url && (
              <a 
                href={itemData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline truncate"
              >
                <ExternalLink className="h-3 w-3 flex-shrink-0" /> 
                <span className="truncate">{urlMetadata?.title || 'View product'}</span>
              </a>
            )}
            
            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="h-7 text-xs">
                <Edit2 className="h-3 w-3 mr-1" /> Edit
              </Button>
              {item.id && (
                <Button size="sm" variant="outline" onClick={handleDelete} className="h-7 text-xs text-destructive hover:text-destructive">
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

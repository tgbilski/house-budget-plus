// src/components/GiftItem.tsx
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Trash2, 
  ExternalLink, 
  Edit2, 
  Save, 
  ShoppingCart, 
  Gift, 
  Package, 
  Truck,
  Star,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { GiftItemData, GiftStatus, GiftPriority, GIFT_CATEGORIES } from '@/hooks/useGiftLists';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface GiftItemProps {
  item: Partial<GiftItemData>;
  onSave: (updatedItem: Partial<GiftItemData>) => Promise<void>;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: GiftStatus) => Promise<void>;
  isNew?: boolean;
  onCancel?: () => void;
}

const STATUS_CONFIG: Record<GiftStatus, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  idea: { label: 'Idea', icon: Gift, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  purchased: { label: 'Purchased', icon: ShoppingCart, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  wrapped: { label: 'Wrapped', icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  delivered: { label: 'Delivered', icon: Truck, color: 'text-green-600', bgColor: 'bg-green-100' }
};

const PRIORITY_CONFIG: Record<GiftPriority, { label: string; color: string; bgColor: string }> = {
  must_have: { label: 'Must Have', color: 'text-red-600', bgColor: 'bg-red-100' },
  nice_to_have: { label: 'Nice to Have', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  backup: { label: 'Backup', color: 'text-gray-500', bgColor: 'bg-gray-100' }
};

export function GiftItem({ item, onSave, onDelete, onStatusChange, isNew = false, onCancel }: GiftItemProps) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [isExpanded, setIsExpanded] = useState(false);
  const [itemData, setItemData] = useState<Partial<GiftItemData>>({
    ...item,
    status: item.status || 'idea',
    priority: item.priority || 'nice_to_have',
    quantity: item.quantity || 1,
    quantity_purchased: item.quantity_purchased || 0
  });
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
    if (item.id && onStatusChange) {
      await onStatusChange(item.id, newStatus);
    } else {
      setItemData(prev => ({ ...prev, status: newStatus }));
    }
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

  const currentStatus = (itemData.status as GiftStatus) || 'idea';
  const currentPriority = (itemData.priority as GiftPriority) || 'nice_to_have';
  const StatusIcon = STATUS_CONFIG[currentStatus].icon;

  if (isEditing) {
    return (
      <div className="border-2 border-primary/20 rounded-xl p-4 space-y-4 bg-gradient-to-br from-background to-muted/30 shadow-lg">
        <div className="space-y-4">
          {/* Gift Idea Name */}
          <div>
            <Label htmlFor={`gift-idea-${item.id}`} className="text-sm font-semibold">Gift Idea *</Label>
            <Input 
              id={`gift-idea-${item.id}`} 
              value={itemData.gift_idea || ''} 
              onChange={(e) => handleInputChange('gift_idea', e.target.value)} 
              placeholder="What's the gift?" 
              className="mt-1"
            />
          </div>
          
          {/* Price and Category Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`price-${item.id}`} className="text-sm font-semibold">Price ($)</Label>
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
              <Label className="text-sm font-semibold">Category</Label>
              <Select 
                value={itemData.category || ''} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {GIFT_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority and Quantity Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-semibold">Priority</Label>
              <Select 
                value={itemData.priority || 'nice_to_have'} 
                onValueChange={(value) => handleInputChange('priority', value as GiftPriority)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="must_have">
                    <span className="flex items-center gap-2">
                      <Star className="h-3 w-3 text-red-500 fill-red-500" /> Must Have
                    </span>
                  </SelectItem>
                  <SelectItem value="nice_to_have">
                    <span className="flex items-center gap-2">
                      <Star className="h-3 w-3 text-amber-500" /> Nice to Have
                    </span>
                  </SelectItem>
                  <SelectItem value="backup">
                    <span className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-gray-400" /> Backup Option
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`quantity-${item.id}`} className="text-sm font-semibold">Quantity</Label>
              <Input 
                id={`quantity-${item.id}`} 
                type="number" 
                min="1"
                value={itemData.quantity || 1} 
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)} 
                className="mt-1"
              />
            </div>
          </div>

          {/* URL */}
          <div>
            <Label htmlFor={`url-${item.id}`} className="text-sm font-semibold">Link (optional)</Label>
            <Input 
              id={`url-${item.id}`} 
              value={itemData.url || ''} 
              onChange={(e) => handleInputChange('url', e.target.value)} 
              placeholder="https://..." 
              className="mt-1"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor={`notes-${item.id}`} className="text-sm font-semibold">Notes (size, color, preferences)</Label>
            <Textarea 
              id={`notes-${item.id}`} 
              value={itemData.notes || ''} 
              onChange={(e) => handleInputChange('notes', e.target.value)} 
              placeholder="Add any specific details like size, color, model..." 
              className="mt-1 min-h-[60px]"
            />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} size="sm" className="flex-1">
            <Save className="h-4 w-4 mr-1" /> Save Gift
          </Button>
          <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "border rounded-xl overflow-hidden transition-all duration-300 group shadow-sm hover:shadow-md",
      currentStatus === 'delivered' && "border-green-200 bg-green-50/50",
      currentStatus === 'wrapped' && "border-purple-200 bg-purple-50/50",
      currentStatus === 'purchased' && "border-blue-200 bg-blue-50/50",
      currentStatus === 'idea' && "border-gray-200 bg-white"
    )}>
      {/* Image Preview */}
      {urlMetadata?.image && (
        <div className="relative h-32 w-full overflow-hidden bg-muted">
          <img 
            src={urlMetadata.image} 
            alt="Product preview" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Priority Badge Overlay */}
          {currentPriority === 'must_have' && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-red-500 text-white text-xs">
                <Star className="h-3 w-3 mr-1 fill-white" /> Must Have
              </Badge>
            </div>
          )}
        </div>
      )}
      
      <div className="p-3">
        {/* Header Row with Status and Actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-sm text-foreground leading-tight">
                {itemData.gift_idea || 'Untitled Gift'}
              </h4>
              {!urlMetadata?.image && currentPriority === 'must_have' && (
                <Star className="h-3 w-3 text-red-500 fill-red-500 flex-shrink-0" />
              )}
            </div>
            
            {/* Category and Quantity */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {itemData.category && (
                <Badge variant="outline" className="text-xs py-0 h-5">
                  {itemData.category}
                </Badge>
              )}
              {(itemData.quantity || 1) > 1 && (
                <span className="text-xs text-muted-foreground">
                  Qty: {itemData.quantity_purchased || 0}/{itemData.quantity || 1}
                </span>
              )}
            </div>
          </div>
          
          {/* Price */}
          {itemData.price ? (
            <span className="font-bold text-base text-green-600 whitespace-nowrap">
              ${Number(itemData.price).toFixed(2)}
            </span>
          ) : null}
        </div>

        {/* Status Progress Bar */}
        <div className="flex items-center gap-1 my-3">
          {(['idea', 'purchased', 'wrapped', 'delivered'] as GiftStatus[]).map((status, idx) => {
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            const isActive = status === currentStatus;
            const isPast = ['idea', 'purchased', 'wrapped', 'delivered'].indexOf(currentStatus) >= idx;
            
            return (
              <button
                key={status}
                onClick={() => handleStatusClick(status)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 py-1.5 px-1 rounded-md text-xs font-medium transition-all",
                  "hover:scale-105 cursor-pointer",
                  isActive && config.bgColor,
                  isActive && config.color,
                  !isActive && isPast && "bg-muted/50 text-muted-foreground",
                  !isActive && !isPast && "bg-transparent text-muted-foreground/50"
                )}
                title={config.label}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Notes Preview */}
        {itemData.notes && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2 mb-2 line-clamp-2">
            📝 {itemData.notes}
          </p>
        )}

        {/* URL Link */}
        {itemData.url && (
          <a 
            href={itemData.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline mb-2"
          >
            <ExternalLink className="h-3 w-3 flex-shrink-0" /> 
            <span className="truncate">
              {urlMetadata?.title || 'View product'}
            </span>
          </a>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsEditing(true)} 
              className="h-7 text-xs"
            >
              <Edit2 className="h-3 w-3 mr-1" /> Edit
            </Button>
            {item.id && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDelete} 
                className="h-7 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            )}
          </div>
          
          {itemData.purchased_at && (
            <span className="text-xs text-muted-foreground">
              Bought {new Date(itemData.purchased_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

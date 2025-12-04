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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  MoreHorizontal,
  StickyNote
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

const STATUS_CONFIG: Record<GiftStatus, { label: string; icon: React.ElementType; color: string; bgColor: string; borderColor: string }> = {
  idea: { label: 'Idea', icon: Gift, color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-300' },
  purchased: { label: 'Purchased', icon: ShoppingCart, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
  wrapped: { label: 'Wrapped', icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-300' },
  delivered: { label: 'Delivered', icon: Truck, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-300' }
};

const PRIORITY_CONFIG: Record<GiftPriority, { label: string; color: string; icon?: React.ElementType }> = {
  must_have: { label: 'Must Have', color: 'text-red-500', icon: Star },
  nice_to_have: { label: 'Nice to Have', color: 'text-amber-500' },
  backup: { label: 'Backup', color: 'text-gray-400' }
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
      if (!error && data && (data.image || data.title)) {
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
  const statusConfig = STATUS_CONFIG[currentStatus];
  const StatusIcon = statusConfig.icon;
  const PriorityIcon = PRIORITY_CONFIG[currentPriority].icon;

  // Edit Mode
  if (isEditing) {
    return (
      <div className="border-2 border-primary/20 rounded-xl p-4 space-y-4 bg-gradient-to-br from-background to-muted/30 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-semibold">Gift Idea *</Label>
              <Input 
                value={itemData.gift_idea || ''} 
                onChange={(e) => handleInputChange('gift_idea', e.target.value)} 
                placeholder="What's the gift?" 
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm font-semibold">Price ($)</Label>
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
                <Label className="text-sm font-semibold">Quantity</Label>
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
              <Label className="text-sm font-semibold">Link (optional)</Label>
              <Input 
                value={itemData.url || ''} 
                onChange={(e) => handleInputChange('url', e.target.value)} 
                placeholder="https://..." 
                className="mt-1"
              />
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
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
                    <SelectItem value="must_have">Must Have</SelectItem>
                    <SelectItem value="nice_to_have">Nice to Have</SelectItem>
                    <SelectItem value="backup">Backup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold">Category</Label>
                <Select 
                  value={itemData.category || ''} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {GIFT_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Notes (size, color, etc.)</Label>
              <Textarea 
                value={itemData.notes || ''} 
                onChange={(e) => handleInputChange('notes', e.target.value)} 
                placeholder="Size M, Blue color preferred..." 
                className="mt-1 min-h-[80px]"
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2 border-t">
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

  // Display Mode - Clean Row Layout
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className={cn(
        "border rounded-lg transition-all",
        statusConfig.borderColor,
        statusConfig.bgColor
      )}>
        {/* Main Row - Always Visible */}
        <div className="flex items-center gap-3 p-3">
          {/* Thumbnail */}
          {urlMetadata?.image ? (
            <img 
              src={urlMetadata.image} 
              alt="" 
              className="w-12 h-12 rounded-md object-cover flex-shrink-0"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          ) : (
            <div className={cn(
              "w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0",
              statusConfig.bgColor
            )}>
              <StatusIcon className={cn("h-5 w-5", statusConfig.color)} />
            </div>
          )}
          
          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">
                {itemData.gift_idea || 'Untitled Gift'}
              </h4>
              {currentPriority === 'must_have' && (
                <Star className="h-3.5 w-3.5 text-red-500 fill-red-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              {itemData.category && <span>{itemData.category}</span>}
              {itemData.category && itemData.notes && <span>•</span>}
              {itemData.notes && (
                <span className="flex items-center gap-0.5 truncate">
                  <StickyNote className="h-3 w-3" /> Has notes
                </span>
              )}
            </div>
          </div>
          
          {/* Price */}
          <div className="text-right flex-shrink-0">
            {itemData.price ? (
              <span className="font-semibold text-green-600">
                ${Number(itemData.price).toFixed(2)}
              </span>
            ) : (
              <span className="text-muted-foreground text-sm">No price</span>
            )}
            {(itemData.quantity || 1) > 1 && (
              <div className="text-xs text-muted-foreground">
                ×{itemData.quantity}
              </div>
            )}
          </div>
          
          {/* Status Badge */}
          <Badge 
            variant="outline" 
            className={cn(
              "flex-shrink-0 cursor-pointer hover:opacity-80",
              statusConfig.color,
              statusConfig.bgColor
            )}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
          
          {/* Expand Button */}
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
        </div>
        
        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0 space-y-3 border-t border-border/50">
            {/* Status Selector */}
            <div className="flex items-center gap-1 pt-3">
              <span className="text-xs text-muted-foreground mr-2">Status:</span>
              {(['idea', 'purchased', 'wrapped', 'delivered'] as GiftStatus[]).map((status) => {
                const config = STATUS_CONFIG[status];
                const Icon = config.icon;
                const isActive = status === currentStatus;
                
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusClick(status)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all",
                      isActive ? cn(config.bgColor, config.color, "ring-1", config.borderColor) : "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </button>
                );
              })}
            </div>
            
            {/* Notes */}
            {itemData.notes && (
              <div className="bg-background/50 rounded-md p-2 text-sm">
                <span className="font-medium text-xs text-muted-foreground">Notes:</span>
                <p className="mt-0.5">{itemData.notes}</p>
              </div>
            )}
            
            {/* Link */}
            {itemData.url && (
              <a 
                href={itemData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" /> 
                {urlMetadata?.title || 'View product'}
              </a>
            )}
            
            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="h-7 text-xs">
                  <Edit2 className="h-3 w-3 mr-1" /> Edit
                </Button>
                {item.id && (
                  <Button size="sm" variant="ghost" onClick={handleDelete} className="h-7 text-xs text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                )}
              </div>
              {itemData.purchased_at && (
                <span className="text-xs text-muted-foreground">
                  Purchased {new Date(itemData.purchased_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

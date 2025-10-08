// src/components/VendorCard.tsx
import React, { useState, useEffect } from 'react';
import { Building, Calendar, Phone, DollarSign, Edit3, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { YearSelector } from '@/components/YearSelector';
import type { VendorQuote } from '@/hooks/useVendorProjects';

interface VendorCardProps {
  quote: VendorQuote;
  onUpdate: (updatedQuote: VendorQuote) => void;
  onRemove: (quoteId: string) => void;
  showRemove: boolean;
  currencySymbol: string;
}

export const VendorCard: React.FC<VendorCardProps> = ({ quote, onUpdate, onRemove, showRemove, currencySymbol }) => {
  const [isEditing, setIsEditing] = useState(!quote.vendor_name && quote.estimate_amount === 0);
  const [localQuote, setLocalQuote] = useState<VendorQuote>(quote);

  // NOTE: The problematic auto-saving useEffect with setTimeout has been removed.
  // We now only save explicitly when the user clicks the "Save" button.

  useEffect(() => {
    setLocalQuote(quote);
  }, [quote]);

  const updateLocalField = (field: keyof VendorQuote, value: any) => {
    setLocalQuote(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate(localQuote);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setLocalQuote(quote);
    setIsEditing(false);
  }

  const getStarCount = () => {
    const factors = [
      localQuote.liked_sales_rep, localQuote.offers_financing,
      localQuote.good_timing, localQuote.trustworthy, localQuote.responsive
    ];
    return factors.filter(Boolean).length;
  };

  const getBadgeColor = (count: number) => {
    if (count >= 4) return 'bg-green-100 text-green-800';
    if (count >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isEditing) {
    // --- EDITING VIEW ---
    return (
      <Card className="border-l-4 border-l-primary ring-2 ring-primary/20">
        <CardHeader className="pb-3 md:pb-4">
          <div className="space-y-1">
            <Label className="text-sm">Vendor Name</Label>
            <Input
              placeholder="Company name..."
              value={localQuote.vendor_name}
              onChange={(e) => updateLocalField('vendor_name', e.target.value)}
              className="text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 gap-3 md:gap-4">
            <div>
              <Label className="text-sm">Estimate</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={localQuote.estimate_amount || ''}
                  onChange={(e) => updateLocalField('estimate_amount', parseFloat(e.target.value) || 0)}
                  className="pl-8 text-sm" placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">Date</Label>
              <Input
                type="date" className="mt-1 text-sm"
                value={localQuote.date_received}
                onChange={(e) => updateLocalField('date_received', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="text-sm">Contact Info</Label>
            <Input 
              className="mt-1 text-sm" 
              value={localQuote.contact_info} 
              onChange={(e) => updateLocalField('contact_info', e.target.value)} 
              placeholder="Phone, email, etc."
            />
          </div>
          <div>
            <Label className="mb-2 block text-sm">Quick Evaluation</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'liked_sales_rep' as keyof VendorQuote, label: 'Good Rep' },
                { key: 'offers_financing' as keyof VendorQuote, label: 'Financing' },
                { key: 'good_timing' as keyof VendorQuote, label: 'Good Timing' },
                { key: 'trustworthy' as keyof VendorQuote, label: 'Trustworthy' },
                { key: 'responsive' as keyof VendorQuote, label: 'Responsive' }
              ].map(({ key, label }) => (
                <Button 
                  key={key} 
                  variant={localQuote[key] ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => updateLocalField(key, !localQuote[key])} 
                  className="h-8 text-xs px-2"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm">Notes</Label>
            <Textarea 
              className="mt-1 resize-none text-sm" 
              value={localQuote.notes} 
              onChange={(e) => updateLocalField('notes', e.target.value)} 
              placeholder="Additional notes..." 
              rows={2} 
            />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={handleSave} size="sm" className="w-full">
              <Check className="h-4 w-4 mr-1" /> Save
            </Button>
            <div className="flex gap-2">
              <Button onClick={handleCancel} size="sm" variant="outline" className="flex-1">
                Cancel
              </Button>
              {showRemove && (
                <Button variant="destructive" size="sm" onClick={() => onRemove(quote.id)} className="flex-1">
                  <Trash2 className="h-4 w-4 mr-1" />
                  <span>Delete</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- DISPLAY VIEW ---
  const starCount = getStarCount();
  return (
    <Card className="hover:shadow-lg transition-all duration-200 group border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardContent className="p-3 md:p-4" onClick={() => setIsEditing(true)}>
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm md:text-base truncate mb-1 md:mb-2">
              {localQuote.vendor_name || 'Untitled Vendor'}
            </h3>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-lg md:text-xl font-bold text-primary">
                {currencySymbol}{localQuote.estimate_amount?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={`${getBadgeColor(starCount)} text-xs`}>
              {starCount}/5
            </Badge>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 md:h-8 md:w-8 p-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit3 className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              {showRemove && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => { e.stopPropagation(); onRemove(quote.id); }} 
                  className="h-7 w-7 md:h-8 md:w-8 p-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-1 text-xs md:text-sm text-muted-foreground">
          {localQuote.contact_info && (
            <div className="flex items-center gap-2 truncate">
              <Phone className="h-3 w-3 flex-shrink-0" /> 
              <span className="truncate">{localQuote.contact_info}</span>
            </div>
          )}
          {localQuote.date_received && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 flex-shrink-0" /> 
              {new Date(localQuote.date_received).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

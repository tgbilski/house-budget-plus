import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrency } from './BudgetApp';

interface StreamingService {
  id: string;
  name: string;
}

interface StreamingServiceSelectorProps {
  value: number;
  onChange: (amount: number) => void;
  label: string;
  expenseId: string;
  selectedService?: string;
  onServiceChange?: (serviceId: string) => void;
}

const streamingServices: StreamingService[] = [
  { id: 'netflix', name: 'Netflix' },
  { id: 'disney-plus', name: 'Disney+' },
  { id: 'hulu', name: 'Hulu' },
  { id: 'amazon-prime', name: 'Amazon Prime Video' },
  { id: 'max', name: 'Max (HBO Max)' },
  { id: 'spotify', name: 'Spotify' },
  { id: 'apple-music', name: 'Apple Music' },
  { id: 'youtube-premium', name: 'YouTube Premium' },
  { id: 'paramount-plus', name: 'Paramount+' },
  { id: 'peacock', name: 'Peacock' },
  { id: 'custom', name: 'Custom Service' }
];

export function StreamingServiceSelector({ 
  value, 
  onChange, 
  label, 
  expenseId, 
  selectedService = 'custom', 
  onServiceChange 
}: StreamingServiceSelectorProps) {
  const { currency } = useCurrency();
  
  const handleServiceSelect = (serviceId: string) => {
    console.log(`[${expenseId}] Service selected:`, serviceId);
    onServiceChange?.(serviceId);
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">
        {label}
      </Label>
      
      <Select value={selectedService} onValueChange={handleServiceSelect}>
        <SelectTrigger className="h-7 text-xs">
          <SelectValue placeholder="Choose service..." />
        </SelectTrigger>
        <SelectContent className="max-h-60 bg-popover border shadow-lg z-50">
          {streamingServices.map((service) => (
            <SelectItem 
              key={service.id} 
              value={service.id}
              className="text-xs"
            >
              {service.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Always show custom input for amount */}
      <div className="relative">
        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs">
          {currency.symbol}
        </span>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="pl-6 h-7 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="0.00"
        />
      </div>
    </div>
  );
}
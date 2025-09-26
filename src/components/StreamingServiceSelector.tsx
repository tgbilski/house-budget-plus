import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrency } from '@/hooks/useCurrency';

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
  placeholder?: string;
}

const streamingServices: StreamingService[] = [
  { id: 'netflix', name: 'Netflix ($15.00)' },
  { id: 'disney-plus', name: 'Disney+ ($15.00)' },
  { id: 'hulu', name: 'Hulu ($15.00)' },
  { id: 'amazon-prime', name: 'Amazon Prime Video ($15.00)' },
  { id: 'max', name: 'Max (HBO Max) ($15.00)' },
  { id: 'spotify', name: 'Spotify ($15.00)' },
  { id: 'apple-music', name: 'Apple Music ($15.00)' },
  { id: 'paramount-plus', name: 'Paramount+ ($15.00)' },
  { id: 'peacock', name: 'Peacock ($15.00)' },
  { id: 'custom', name: 'Select Subscription' }
];

export function StreamingServiceSelector({ 
  value, 
  onChange, 
  label, 
  expenseId, 
  selectedService = 'custom', 
  onServiceChange,
  placeholder = "subscription option"
}: StreamingServiceSelectorProps) {
  const { currency } = useCurrency();
  
  const handleServiceSelect = (serviceId: string) => {
    console.log(`[${expenseId}] Service selected:`, serviceId);
    onServiceChange?.(serviceId);
    // Set $15 for subscription services, $0 for custom/select subscription
    const amount = serviceId === 'custom' ? 0 : 15;
    onChange(amount);
  };

  return (
    <div className="space-y-1">
      <Select value={selectedService} onValueChange={handleServiceSelect}>
        <SelectTrigger className="h-6 text-xs">
          <SelectValue placeholder={placeholder} />
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
    </div>
  );
}
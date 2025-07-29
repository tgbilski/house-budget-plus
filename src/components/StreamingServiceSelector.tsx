import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrency } from './BudgetApp';

interface StreamingService {
  id: string;
  name: string;
  tiers: {
    name: string;
    price: number;
  }[];
}

interface StreamingServiceSelectorProps {
  value: number;
  onChange: (amount: number) => void;
  label: string;
  expenseId: string;
}

const streamingServices: StreamingService[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    tiers: [
      { name: 'Standard with ads', price: 6.99 },
      { name: 'Standard', price: 15.49 },
      { name: 'Premium', price: 22.99 }
    ]
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    tiers: [
      { name: 'Basic with ads', price: 7.99 },
      { name: 'Premium', price: 13.99 }
    ]
  },
  {
    id: 'hulu',
    name: 'Hulu',
    tiers: [
      { name: 'With ads', price: 7.99 },
      { name: 'No ads', price: 17.99 },
      { name: 'Live TV', price: 76.99 }
    ]
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime Video',
    tiers: [
      { name: 'Monthly', price: 8.99 },
      { name: 'Annual (monthly equivalent)', price: 11.98 }
    ]
  },
  {
    id: 'max',
    name: 'Max (HBO Max)',
    tiers: [
      { name: 'With ads', price: 9.99 },
      { name: 'Ad-free', price: 15.99 },
      { name: 'Ultimate Ad-free', price: 19.99 }
    ]
  },
  {
    id: 'spotify',
    name: 'Spotify',
    tiers: [
      { name: 'Individual', price: 10.99 },
      { name: 'Duo', price: 14.99 },
      { name: 'Family', price: 16.99 }
    ]
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    tiers: [
      { name: 'Individual', price: 10.99 },
      { name: 'Family', price: 16.99 }
    ]
  },
  {
    id: 'youtube-premium',
    name: 'YouTube Premium',
    tiers: [
      { name: 'Individual', price: 13.99 },
      { name: 'Family', price: 22.99 }
    ]
  },
  {
    id: 'paramount-plus',
    name: 'Paramount+',
    tiers: [
      { name: 'Essential', price: 5.99 },
      { name: 'With Showtime', price: 11.99 }
    ]
  },
  {
    id: 'peacock',
    name: 'Peacock',
    tiers: [
      { name: 'Premium', price: 5.99 },
      { name: 'Premium Plus', price: 11.99 }
    ]
  }
];

export function StreamingServiceSelector({ value, onChange, label, expenseId }: StreamingServiceSelectorProps) {
  const { currency } = useCurrency();
  
  const handleServiceSelect = (serviceAndTier: string) => {
    if (serviceAndTier === 'custom') {
      // Keep current value for custom input
      return;
    }
    
    const [serviceId, tierIndex] = serviceAndTier.split('-');
    const service = streamingServices.find(s => s.id === serviceId);
    if (service && service.tiers[parseInt(tierIndex)]) {
      onChange(service.tiers[parseInt(tierIndex)].price);
    }
  };

  const getCurrentSelection = () => {
    for (const service of streamingServices) {
      for (let i = 0; i < service.tiers.length; i++) {
        if (Math.abs(service.tiers[i].price - value) < 0.01) {
          return `${service.id}-${i}`;
        }
      }
    }
    return 'custom';
  };

  const isCustomValue = getCurrentSelection() === 'custom';

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">
        {label}
      </Label>
      
      <Select value={getCurrentSelection()} onValueChange={handleServiceSelect}>
        <SelectTrigger className="h-7 text-xs">
          <SelectValue placeholder="Choose service..." />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {streamingServices.map((service) => (
            <React.Fragment key={service.id}>
              {service.tiers.map((tier, index) => (
                <SelectItem 
                  key={`${service.id}-${index}`} 
                  value={`${service.id}-${index}`}
                  className="text-xs"
                >
                  <div className="flex justify-between items-center w-full">
                    <span>{service.name} - {tier.name}</span>
                    <span className="ml-2 font-mono text-muted-foreground">
                      {currency.symbol}{tier.price}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </React.Fragment>
          ))}
          <SelectItem value="custom" className="text-xs font-medium border-t">
            Custom Amount
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Custom input when 'Custom Amount' is selected or value doesn't match any preset */}
      {isCustomValue && (
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
      )}
    </div>
  );
}

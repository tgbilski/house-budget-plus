import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STREAMING_SERVICES = [
  { id: 'netflix', name: 'Netflix', price: 15.49 },
  { id: 'hulu', name: 'Hulu', price: 7.99 },
  { id: 'disney', name: 'Disney+', price: 7.99 },
  { id: 'hbo', name: 'Max', price: 9.99 },
  { id: 'spotify', name: 'Spotify', price: 10.99 },
  { id: 'apple_music', name: 'Apple Music', price: 10.99 },
  { id: 'youtube', name: 'YouTube Premium', price: 13.99 },
  { id: 'amazon', name: 'Prime Video', price: 8.99 },
  { id: 'peacock', name: 'Peacock', price: 5.99 },
  { id: 'paramount', name: 'Paramount+', price: 5.99 },
  { id: 'custom', name: 'Other', price: 0 },
];

interface StreamingServiceSelectorProps {
  value: number;
  onChange: (amount: number) => void;
  label: string;
  expenseId: string;
  selectedService: string;
  onServiceChange: (serviceId: string) => void;
  placeholder?: string;
}

export const StreamingServiceSelector: React.FC<StreamingServiceSelectorProps> = ({
  value,
  onChange,
  label,
  selectedService,
  onServiceChange,
}) => {
  const handleServiceSelect = (serviceId: string) => {
    onServiceChange(serviceId);
    const service = STREAMING_SERVICES.find(s => s.id === serviceId);
    if (service && service.price > 0) {
      onChange(service.price);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="flex gap-2">
        <Select value={selectedService} onValueChange={handleServiceSelect}>
          <SelectTrigger className="h-9 text-xs flex-1">
            <SelectValue placeholder="Pick a service" />
          </SelectTrigger>
          <SelectContent>
            {STREAMING_SERVICES.map((service) => (
              <SelectItem key={service.id} value={service.id} className="text-xs">
                {service.name}{service.price > 0 ? ` ($${service.price})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="h-9 w-24 text-xs"
          placeholder="$0.00"
          min={0}
          step={0.01}
        />
      </div>
    </div>
  );
};

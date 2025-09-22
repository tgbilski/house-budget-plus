// src/components/VacationCard.tsx
import React, { useState, useEffect } from 'react';
import { Star, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { VacationOption } from '@/hooks/useVacationPlanner'; // Import the type from our hook

interface VacationCardProps {
  option: VacationOption;
  onUpdate: (optionId: string, updates: Partial<VacationOption>) => void;
  onReset: (optionId: string) => void;
  currencySymbol: string;
}

export const VacationCard: React.FC<VacationCardProps> = ({ option, onUpdate, onReset, currencySymbol }) => {
  // Local state for smoother editing. We only tell the parent hook to save on blur.
  const [localOption, setLocalOption] = useState<VacationOption>(option);
  const [isExpanded, setIsExpanded] = useState(false);

  // If the parent's data changes (e.g., after a reset), update our local copy.
  useEffect(() => {
    setLocalOption(option);
  }, [option]);

  // NOTE: The problematic auto-saving useEffect with setTimeout has been removed.

  const handleLocalChange = (field: keyof VacationOption, value: any) => {
    setLocalOption(prev => ({ ...prev, [field]: value }));
  };
  
  // For switches, we can update immediately as it's a single action.
  const handleSwitchChange = (field: keyof VacationOption, checked: boolean) => {
    handleLocalChange(field, checked);
    onUpdate(option.id, { [field]: checked });
  };

  // For inputs, we only save when the user clicks away (onBlur).
  const handleBlur = (field: keyof VacationOption) => {
    if (localOption[field] !== option[field]) {
      onUpdate(option.id, { [field]: localOption[field] });
    }
  };

  const totalCost = (localOption.travel_mode_cost || 0) + (localOption.lodging_cost || 0) + (localOption.car_rental_cost || 0);

  const score = [
    localOption.family_friendly, localOption.good_weather, localOption.activities_available,
    localOption.affordable, localOption.relaxing, localOption.adventurous, localOption.memorable
  ].filter(Boolean).length;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Label>Destination</Label>
            <Input
              value={localOption.destination}
              onChange={(e) => handleLocalChange('destination', e.target.value)}
              onBlur={() => handleBlur('destination')}
              placeholder={`Vacation Option ${option.vacation_number}`}
              className="text-lg font-semibold h-10 mt-1"
            />
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Cost</div>
            <div className="text-2xl font-bold text-primary">{currencySymbol}{totalCost.toLocaleString()}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Travel Mode</Label>
            <Select value={localOption.travel_mode} onValueChange={(value) => onUpdate(option.id, { travel_mode: value })}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="flight">Flight</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="train">Train</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Travel Cost</Label>
            <Input type="number" value={localOption.travel_mode_cost || ''} onChange={(e) => handleLocalChange('travel_mode_cost', parseFloat(e.target.value) || 0)} onBlur={() => handleBlur('travel_mode_cost')} placeholder="0" />
          </div>
          <div>
            <Label>Lodging Cost</Label>
            <Input type="number" value={localOption.lodging_cost || ''} onChange={(e) => handleLocalChange('lodging_cost', parseFloat(e.target.value) || 0)} onBlur={() => handleBlur('lodging_cost')} placeholder="0" />
          </div>
          <div>
            <Label>Car Rental Cost</Label>
            <Input type="number" value={localOption.car_rental_cost || ''} onChange={(e) => handleLocalChange('car_rental_cost', parseFloat(e.target.value) || 0)} onBlur={() => handleBlur('car_rental_cost')} placeholder="0" />
          </div>
        </div>
        
        <div className="flex-1" />

        <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="w-full">
          {isExpanded ? 'Hide Details' : 'Show Evaluation & Notes'}
        </Button>

        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                { key: 'family_friendly' as const, label: 'Family Friendly' },
                { key: 'good_weather' as const, label: 'Good Weather' },
                { key: 'activities_available' as const, label: 'Activities' },
                { key: 'affordable' as const, label: 'Affordable' },
                { key: 'relaxing' as const, label: 'Relaxing' },
                { key: 'adventurous' as const, label: 'Adventurous' },
                { key: 'memorable' as const, label: 'Memorable' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Switch checked={localOption[key]} onCheckedChange={(checked) => handleSwitchChange(key, checked)} id={`${key}-${option.id}`} />
                  <Label htmlFor={`${key}-${option.id}`} className="text-sm cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={localOption.notes} onChange={(e) => handleLocalChange('notes', e.target.value)} onBlur={() => handleBlur('notes')} placeholder="Additional notes..." />
            </div>
          </div>
        )}
        <div className="flex justify-between items-center pt-2">
            <Button variant="ghost" size="sm" onClick={() => onReset(option.id)} className="text-muted-foreground gap-2"><RefreshCw className="h-4 w-4" /> Reset</Button>
            <div className="flex items-center gap-2">
                <div className="flex">
                    {Array.from({ length: 7 }).map((_, i) => <Star key={i} className={`h-5 w-5 ${i < score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                </div>
                <span className="text-sm text-muted-foreground">{score}/7</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

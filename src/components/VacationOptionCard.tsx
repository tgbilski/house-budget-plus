// src/components/VacationOptionCard.tsx
import React, { useState, useEffect } from 'react';
import { Star, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { VacationOption } from '@/hooks/useVacationPlanner';

interface VacationOptionCardProps {
  option: VacationOption;
  onUpdate: (optionId: string, updates: Partial<VacationOption>) => void;
  onReset: (optionId: string) => void;
  currencySymbol: string;
}

// FIX: The function name is now VacationOptionCard
export const VacationOptionCard: React.FC<VacationOptionCardProps> = ({ option, onUpdate, onReset, currencySymbol }) => {
  const [localOption, setLocalOption] = useState<VacationOption>(option);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setLocalOption(option);
  }, [option]);

  const handleLocalChange = (field: keyof VacationOption, value: any) => {
    setLocalOption(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSwitchChange = (field: keyof VacationOption, checked: boolean) => {
    handleLocalChange(field, checked);
    onUpdate(option.id, { [field]: checked });
  };

  const handleBlur = (field: keyof VacationOption) => {
    if (localOption[field] !== option[field]) {
      onUpdate(option.id, { [field]: localOption[field] });
    }
  };

  const totalCost = (localOption.travel_mode_cost || 0) + (localOption.lodging_cost || 0) + (localOption.car_rental_cost || 0);

  const score = [
    // Assuming these boolean fields exist on your VacationOption type
    // @ts-ignore
    localOption.family_friendly, localOption.good_weather, localOption.activities_available,
    // @ts-ignore
    localOption.affordable, localOption.relaxing, localOption.adventurous, localOption.memorable
  ].filter(Boolean).length;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3">
          <div className="w-full">
            <Label className="text-sm mb-1.5 block">Destination</Label>
            <Input
              value={localOption.destination}
              onChange={(e) => handleLocalChange('destination', e.target.value)}
              onBlur={() => handleBlur('destination')}
              placeholder={`Option ${option.vacation_number}`}
              className="text-base sm:text-lg font-semibold h-10"
            />
          </div>
          <div className="w-full bg-primary/5 rounded-lg p-3 border border-primary/20">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">Estimated Total Cost</div>
            <div className="text-xl sm:text-2xl font-bold text-primary">{currencySymbol}{totalCost.toLocaleString()}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Travel Cost</Label>
            <Input type="number" value={localOption.travel_mode_cost || ''} onChange={(e) => handleLocalChange('travel_mode_cost', parseFloat(e.target.value) || 0)} onBlur={() => handleBlur('travel_mode_cost')} placeholder="0" className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Lodging Cost</Label>
            <Input type="number" value={localOption.lodging_cost || ''} onChange={(e) => handleLocalChange('lodging_cost', parseFloat(e.target.value) || 0)} onBlur={() => handleBlur('lodging_cost')} placeholder="0" className="h-9" />
          </div>
           <div className="space-y-1.5">
            <Label className="text-sm">Car Rental Cost</Label>
            <Input type="number" value={localOption.car_rental_cost || ''} onChange={(e) => handleLocalChange('car_rental_cost', parseFloat(e.target.value) || 0)} onBlur={() => handleBlur('car_rental_cost')} placeholder="0" className="h-9" />
          </div>
        </div>
        
        <div className="flex-1" />
        {/* ... evaluation and notes sections ... */}
        <div className="flex justify-between items-center pt-2">
            <Button variant="ghost" size="sm" onClick={() => onReset(option.id)} className="text-muted-foreground gap-2"><RefreshCw className="h-4 w-4" /> Reset</Button>
            {/* ... star rating ... */}
        </div>
      </CardContent>
    </Card>
  );
};

// src/components/VacationOptionCard.tsx
import React, { useState, useEffect } from 'react';
import { X, Plane, Car, ChevronDown, ChevronUp, StickyNote, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { PlaceSearchInput } from '@/components/vacation/PlaceSearchInput';
import type { VacationOption } from '@/hooks/useVacationPlanner';

interface VacationOptionCardProps {
  option: VacationOption;
  onUpdate: (optionId: string, updates: Partial<VacationOption>) => void;
  onReset: (optionId: string) => void;
  currencySymbol: string;
  optionNumber: number;
}

const RATING_OPTIONS = [
  { value: 5, label: '🔥 LFG!', color: 'bg-gradient-to-r from-orange-400 to-pink-500' },
  { value: 4, label: '😍 Love it', color: 'bg-gradient-to-r from-teal to-emerald-400' },
  { value: 3, label: '👍 Solid', color: 'bg-gradient-to-r from-blue-400 to-cyan-400' },
  { value: 2, label: '🤔 Maybe', color: 'bg-gradient-to-r from-yellow-400 to-orange-400' },
  { value: 1, label: '👎 Nah', color: 'bg-gradient-to-r from-gray-400 to-gray-500' },
];

// FIX: The function name is now VacationOptionCard
export const VacationOptionCard: React.FC<VacationOptionCardProps> = ({ option, onUpdate, onReset, currencySymbol, optionNumber }) => {
  const [localOption, setLocalOption] = useState<VacationOption>(option);
  const [notesOpen, setNotesOpen] = useState(false);

  useEffect(() => {
    setLocalOption(option);
  }, [option]);

  const handleLocalChange = (field: keyof VacationOption, value: any) => {
    setLocalOption(prev => ({ ...prev, [field]: value }));
  };

  const handleRatingChange = (value: string) => {
    const rating = value === 'none' ? null : parseInt(value);
    handleLocalChange('overall_rating', rating);
    onUpdate(option.id, { overall_rating: rating });
  };

  const handleBlur = (field: keyof VacationOption) => {
    if (localOption[field] !== option[field]) {
      onUpdate(option.id, { [field]: localOption[field] });
    }
  };

  const handlePlaceSelect = (place: { name: string; lat: number; lng: number }) => {
    handleLocalChange('destination', place.name);
    handleLocalChange('destination_lat', place.lat || null);
    handleLocalChange('destination_lng', place.lng || null);
    onUpdate(option.id, { 
      destination: place.name,
      destination_lat: place.lat || null,
      destination_lng: place.lng || null
    });
  };

  const totalCost = (localOption.travel_mode_cost || 0) + (localOption.lodging_cost || 0) + (localOption.car_rental_cost || 0);

  const currentRating = RATING_OPTIONS.find(r => r.value === localOption.overall_rating);

  const searchFlightsUrl = localOption.destination 
    ? `https://www.google.com/travel/flights?q=flights%20to%20${encodeURIComponent(localOption.destination)}`
    : null;
  
  const searchCarsUrl = localOption.destination
    ? `https://www.kayak.com/cars/${encodeURIComponent(localOption.destination)}`
    : null;

  return (
    <Card className="h-full flex flex-col relative group overflow-hidden hover:shadow-cartoon-hover hover:-translate-y-1 transition-all duration-200">
      {/* Fun gradient header accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-jazz" />
      
      {/* Option number badge */}
      <div className="absolute top-3 left-3 z-10">
         <div className="w-8 h-8 rounded-full bg-gradient-jazz flex items-center justify-center text-accent font-bold text-sm border-2 border-background">
          {optionNumber}
        </div>
      </div>
      
      {/* Delete button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onReset(option.id)}
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive z-10"
      >
        <X className="h-4 w-4" />
      </Button>
      
       {/* Prominent Total Cost at Top */}
       <div className="mx-4 mt-4 mb-2 ml-14 mr-10">
         <div className="p-4 text-center">
           <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Estimated Total</div>
           <div className="text-2xl sm:text-3xl font-bold text-accent">{currencySymbol}{totalCost.toLocaleString()}</div>
         </div>
       </div>
       
       <CardHeader className="pb-3 pr-10 pt-2 pl-14">
         {/* Helper text */}
         <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
           <Sparkles className="h-3 w-3" />
           Enter rough estimates to compare options
         </p>
         
         <div className="flex flex-col gap-3">
           <div className="w-full">
             <Label className="text-sm mb-1.5 block font-semibold">Where to? 🌴</Label>
             <PlaceSearchInput
               value={localOption.destination}
               onChange={(val) => handleLocalChange('destination', val)}
               onSelect={handlePlaceSelect}
               placeholder="Search destinations..."
             />
           </div>
           
           {/* Quick search links */}
           {localOption.destination && (
             <div className="flex gap-2 flex-wrap">
               <a 
                 href={searchFlightsUrl || '#'} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
               >
                 <Plane className="h-3 w-3" />
                 Search Flights
               </a>
               <a 
                 href={searchCarsUrl || '#'} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full bg-teal/10 text-teal hover:bg-teal/20 transition-colors font-medium"
               >
                 <Car className="h-3 w-3" />
                 Search Rentals
               </a>
             </div>
           )}
         </div>
       </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col pt-0">
        {/* Cost inputs */}
         <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="space-y-1.5">
             <Label className="text-xs font-medium">✈️ Travel</Label>
             <div className="relative">
               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
               <Input 
                 type="number" 
                 value={localOption.travel_mode_cost || ''} 
                 onChange={(e) => handleLocalChange('travel_mode_cost', parseFloat(e.target.value) || 0)} 
                 onBlur={() => handleBlur('travel_mode_cost')} 
                 placeholder="0" 
                 className="h-8 text-sm pl-5" 
               />
             </div>
          </div>
          <div className="space-y-1.5">
             <Label className="text-xs font-medium">🏨 Lodging</Label>
             <div className="relative">
               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
               <Input 
                 type="number" 
                 value={localOption.lodging_cost || ''} 
                 onChange={(e) => handleLocalChange('lodging_cost', parseFloat(e.target.value) || 0)} 
                 onBlur={() => handleBlur('lodging_cost')} 
                 placeholder="0" 
                 className="h-8 text-sm pl-5" 
               />
             </div>
          </div>
          <div className="space-y-1.5">
             <Label className="text-xs font-medium">🚗 Car</Label>
             <div className="relative">
               <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
               <Input 
                 type="number" 
                 value={localOption.car_rental_cost || ''} 
                 onChange={(e) => handleLocalChange('car_rental_cost', parseFloat(e.target.value) || 0)} 
                 onBlur={() => handleBlur('car_rental_cost')} 
                 placeholder="0" 
                 className="h-8 text-sm pl-5" 
               />
             </div>
          </div>
        </div>
        
        {/* Overall Rating Dropdown */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Overall Vibe Check 🎯</Label>
          <Select 
            value={localOption.overall_rating?.toString() || 'none'} 
            onValueChange={handleRatingChange}
          >
            <SelectTrigger className="h-10 bg-card">
              <SelectValue placeholder="How do you feel about this one?">
                {currentRating ? (
                  <span className="flex items-center gap-2">
                    <Badge className={`${currentRating.color} text-white border-0 text-xs`}>
                      {currentRating.label}
                    </Badge>
                  </span>
                ) : (
                  <span className="text-muted-foreground">Rate this option...</span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="none" className="text-muted-foreground">
                Not rated yet
              </SelectItem>
              {RATING_OPTIONS.map((rating) => (
                <SelectItem key={rating.value} value={rating.value.toString()}>
                  <span className="flex items-center gap-2">
                    <Badge className={`${rating.color} text-white border-0 text-xs`}>
                      {rating.label}
                    </Badge>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Collapsible Notes Section */}
        <Collapsible open={notesOpen} onOpenChange={setNotesOpen} className="mt-auto">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between text-muted-foreground hover:text-foreground h-8 px-2"
            >
              <span className="flex items-center gap-1.5 text-xs">
                <StickyNote className="h-3 w-3" />
                {localOption.notes ? 'View/Edit Notes' : 'Add Notes'}
              </span>
              {notesOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <Textarea
              value={localOption.notes}
              onChange={(e) => handleLocalChange('notes', e.target.value)}
              onBlur={() => handleBlur('notes')}
              placeholder="Jot down thoughts... 'Babe would love the beach here!' or 'Too expensive for what it is'"
              className="min-h-[80px] text-sm resize-none"
            />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

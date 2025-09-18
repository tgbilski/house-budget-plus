import React, { useState, useEffect, useCallback } from 'react';
import { Edit3, Star, Check, RefreshCw, Plane, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { useBadges } from '@/hooks/useBadges';
import { supabase } from '@/integrations/supabase/client';
import { AIChatbot } from '@/components/AIChatbot';

import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InternalLinks } from '@/components/InternalLinks';
import { SocialShare } from '@/components/SocialShare';
import { FAQ } from '@/components/FAQ';
import { vacationPlanningFAQs } from '@/utils/faqData';
import { WarningBanner } from '@/components/WarningBanner';

interface VacationOption {
  id: string;
  user_id: string;
  vacation_number: number;
  destination: string;
  travel_mode: string;
  travel_mode_cost: number;
  lodging_cost: number;
  car_rental_cost: number;
  notes: string;
  contact: string;
  favorable_travel: boolean;
  destination_safe: boolean;
  exciting_option: boolean;
  everyone_enjoy: boolean;
  memorable: boolean;
  created_at?: string;
  updated_at?: string;
}

interface VacationCardProps {
  option: VacationOption;
  onUpdate: (option: VacationOption) => void;
  currency: any;
  vacationNumber: number;
}

const VacationCard: React.FC<VacationCardProps> = ({ option, onUpdate, currency, vacationNumber }) => {
  const [localOption, setLocalOption] = useState(option);
  const [isEditing, setIsEditing] = useState(true);

  const updateField = useCallback((field: keyof VacationOption, value: any) => {
    const updated = { ...localOption, [field]: value };
    setLocalOption(updated);
    onUpdate(updated);
  }, [localOption, onUpdate]);

  const getStarCount = () => {
    const evaluationFields = [
      localOption.favorable_travel,
      localOption.destination_safe,
      localOption.exciting_option,
      localOption.everyone_enjoy,
      localOption.memorable
    ];
    return evaluationFields.filter(Boolean).length;
  };

  const getTotalCost = () => {
    return (localOption.travel_mode_cost || 0) + (localOption.lodging_cost || 0) + (localOption.car_rental_cost || 0);
  };

  const questions = [
    { key: 'favorable_travel' as const, label: 'Is the mode of travel favorable?' },
    { key: 'destination_safe' as const, label: 'Is the destination safe?' },
    { key: 'exciting_option' as const, label: 'Does this option excite you?' },
    { key: 'everyone_enjoy' as const, label: 'Will everyone enjoy it?' },
    { key: 'memorable' as const, label: 'Memorable?' }
  ];

  if (isEditing) {
    return (
      <Card className="border border-border/50 hover:border-border transition-colors">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Vacation Option {vacationNumber}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Cost Display */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <Label className="text-sm font-medium text-muted-foreground">Total Cost</Label>
            <div className="text-2xl font-bold text-primary">
              {currency.symbol}{getTotalCost().toFixed(2)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`destination-${option.id}`} className="text-sm font-medium">
                Destination
              </Label>
              <Input
                id={`destination-${option.id}`}
                value={localOption.destination}
                onChange={(e) => updateField('destination', e.target.value)}
                placeholder="Where are you going?"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`travel-mode-${option.id}`} className="text-sm font-medium">
                Travel Mode
              </Label>
              <Input
                id={`travel-mode-${option.id}`}
                value={localOption.travel_mode}
                onChange={(e) => updateField('travel_mode', e.target.value)}
                placeholder="Flight, drive, cruise, etc."
                className="mt-1"
              />
            </div>
          </div>

          {/* Cost Fields */}
          <div className="space-y-4">
            <h4 className="font-medium">Cost Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`travel-cost-${option.id}`} className="text-sm font-medium">
                  Travel ({currency.symbol})
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                    {currency.symbol}
                  </span>
                  <Input
                    id={`travel-cost-${option.id}`}
                    type="number"
                    step="0.01"
                    value={localOption.travel_mode_cost || ''}
                    onChange={(e) => updateField('travel_mode_cost', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor={`lodging-cost-${option.id}`} className="text-sm font-medium">
                  Lodging ({currency.symbol})
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                    {currency.symbol}
                  </span>
                  <Input
                    id={`lodging-cost-${option.id}`}
                    type="number"
                    step="0.01"
                    value={localOption.lodging_cost || ''}
                    onChange={(e) => updateField('lodging_cost', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor={`rental-cost-${option.id}`} className="text-sm font-medium">
                  Car Rental ({currency.symbol})
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                    {currency.symbol}
                  </span>
                  <Input
                    id={`rental-cost-${option.id}`}
                    type="number"
                    step="0.01"
                    value={localOption.car_rental_cost || ''}
                    onChange={(e) => updateField('car_rental_cost', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor={`contact-${option.id}`} className="text-sm font-medium">
              Contact Info
            </Label>
            <Input
              id={`contact-${option.id}`}
              value={localOption.contact}
              onChange={(e) => updateField('contact', e.target.value)}
              placeholder="Travel agent, website, etc."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor={`notes-${option.id}`} className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id={`notes-${option.id}`}
              value={localOption.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Additional details about this vacation option..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Evaluation Questions</h4>
            {questions.map((question) => (
              <div key={question.key} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/20">
                <span className="text-sm">{question.label}</span>
                <div className="flex gap-2">
                  <Button
                    variant={localOption[question.key] === true ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateField(question.key, true)}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={localOption[question.key] === false ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => updateField(question.key, false)}
                  >
                    No
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Summary view
  const renderStars = () => {
    const filledStars = getStarCount();
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < filledStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="border border-border/50 hover:border-border hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">
              Vacation Option {vacationNumber}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {localOption.destination || 'No destination set'}
            </p>
            <div className="text-2xl font-bold text-primary mb-2">
              {currency.symbol}{getTotalCost().toFixed(2)}
            </div>
            {localOption.travel_mode && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Plane className="h-4 w-4" />
                {localOption.travel_mode}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {renderStars()}
            </div>
          </div>
        </div>

        {localOption.contact && (
          <div className="mb-3 p-3 bg-muted/30 rounded-lg">
            <span className="text-sm text-muted-foreground">Contact: </span>
            <span className="text-sm font-medium">{localOption.contact}</span>
          </div>
        )}

        {localOption.notes && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground line-clamp-2">{localOption.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Edit Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Vacation: React.FC = () => {
  const [vacationOptions, setVacationOptions] = useState<VacationOption[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { toast } = useToast();
  const { earnBadge } = useBadges();

  useEffect(() => {
    if (user) {
      loadVacationOptions();
    } else {
      // Initialize with default options for non-authenticated users
      const defaultOptions: VacationOption[] = [1, 2, 3].map(num => ({
        id: `default-${num}`,
        user_id: 'guest',
        vacation_number: num,
        destination: '',
        travel_mode: '',
        travel_mode_cost: 0,
        lodging_cost: 0,
        car_rental_cost: 0,
        notes: '',
        contact: '',
        favorable_travel: false,
        destination_safe: false,
        exciting_option: false,
        everyone_enjoy: false,
        memorable: false
      }));
      setVacationOptions(defaultOptions);
    }
  }, [user]);

  const loadVacationOptions = async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from('vacation_options')
      .select('*')
      .eq('user_id', user.id)
      .order('vacation_number', { ascending: true });

    if (data && data.length > 0) {
      setVacationOptions(data);
    } else {
      // Create the 3 default vacation options
      await initializeVacationOptions();
    }
    setLoading(false);
  };

  const initializeVacationOptions = async () => {
    if (!user) return;

    const defaultOptions = [1, 2, 3].map(num => ({
      user_id: user.id,
      vacation_number: num,
      destination: '',
      travel_mode: '',
      travel_mode_cost: 0,
      lodging_cost: 0,
      car_rental_cost: 0,
      notes: '',
      contact: '',
      favorable_travel: false,
      destination_safe: false,
      exciting_option: false,
      everyone_enjoy: false,
      memorable: false
    }));

    const { data } = await supabase
      .from('vacation_options')
      .insert(defaultOptions)
      .select();

    if (data) {
      setVacationOptions(data);
    }
  };

  const saveVacationOption = async (option: VacationOption) => {
    if (!user) return;

    const { error } = await supabase
      .from('vacation_options')
      .upsert({
        id: option.id,
        user_id: option.user_id,
        vacation_number: option.vacation_number,
        destination: option.destination,
        travel_mode: option.travel_mode,
        travel_mode_cost: option.travel_mode_cost,
        lodging_cost: option.lodging_cost,
        car_rental_cost: option.car_rental_cost,
        notes: option.notes,
        contact: option.contact,
        favorable_travel: option.favorable_travel,
        destination_safe: option.destination_safe,
        exciting_option: option.exciting_option,
        everyone_enjoy: option.everyone_enjoy,
        memorable: option.memorable
      });

    if (error) {
      console.error('Error saving vacation option:', error);
      toast({
        title: "Error",
        description: "Failed to save vacation option",
        variant: "destructive",
      });
    }
  };

  const updateVacationCard = (updatedOption: VacationOption) => {
    setVacationOptions(prev => 
      prev.map(opt => opt.vacation_number === updatedOption.vacation_number ? updatedOption : opt)
    );
    
    if (user) {
      saveVacationOption(updatedOption);
    }
  };

  const resetVacationOption = async (vacationNumber: number) => {
    if (!user) {
      // For guest users, just reset locally
      const resetOption: VacationOption = {
        id: `default-${vacationNumber}`,
        user_id: 'guest',
        vacation_number: vacationNumber,
        destination: '',
        travel_mode: '',
        travel_mode_cost: 0,
        lodging_cost: 0,
        car_rental_cost: 0,
        notes: '',
        contact: '',
        favorable_travel: false,
        destination_safe: false,
        exciting_option: false,
        everyone_enjoy: false,
        memorable: false
      };
      
      setVacationOptions(prev => 
        prev.map(opt => opt.vacation_number === vacationNumber ? resetOption : opt)
      );
      return;
    }

    const { error } = await supabase
      .from('vacation_options')
      .update({
        destination: '',
        travel_mode: '',
        travel_mode_cost: 0,
        lodging_cost: 0,
        car_rental_cost: 0,
        notes: '',
        contact: '',
        favorable_travel: false,
        destination_safe: false,
        exciting_option: false,
        everyone_enjoy: false,
        memorable: false
      })
      .eq('user_id', user.id)
      .eq('vacation_number', vacationNumber);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reset vacation option",
        variant: "destructive",
      });
      return;
    }

    // Update local state
    setVacationOptions(prev => 
      prev.map(opt => 
        opt.vacation_number === vacationNumber 
          ? {
              ...opt,
              destination: '',
              travel_mode: '',
              travel_mode_cost: 0,
              lodging_cost: 0,
              car_rental_cost: 0,
              notes: '',
              contact: '',
              favorable_travel: false,
              destination_safe: false,
              exciting_option: false,
              everyone_enjoy: false,
              memorable: false
            }
          : opt
      )
    );

    toast({
      title: "Reset Complete",
      description: `Vacation Option ${vacationNumber} has been reset`,
    });
  };

  const getTotalBudget = () => {
    return vacationOptions.reduce((total, option) => {
      return total + (option.travel_mode_cost || 0) + (option.lodging_cost || 0) + (option.car_rental_cost || 0);
    }, 0);
  };

  const getBestOption = () => {
    const optionsWithScores = vacationOptions.map(option => {
      const evaluationFields = [
        option.favorable_travel,
        option.destination_safe,
        option.exciting_option,
        option.everyone_enjoy,
        option.memorable
      ];
      const score = evaluationFields.filter(Boolean).length;
      return { ...option, score };
    });

    if (optionsWithScores.length === 0) {
      return { destination: '', score: 0 };
    }

    return optionsWithScores.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center">Loading vacation options...</div>
      </div>
    );
  }

  const bestOption = getBestOption();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <SEO 
        title={seoData.vacation.title}
        description={seoData.vacation.description}
        keywords={seoData.vacation.keywords}
        canonical="/vacation"
      />

      <Breadcrumbs />
      
      <WarningBanner />

      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Vacation Planning</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare different vacation options, track costs, and evaluate each option to find your perfect getaway.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Total Budget</h3>
              <div className="text-2xl font-bold text-primary">
                {currency.symbol}{getTotalBudget().toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Options Compared</h3>
              <div className="text-2xl font-bold text-primary">
                {vacationOptions.filter(opt => opt.destination).length} / 3
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Top Rated</h3>
              <div className="text-lg font-bold text-primary">
                {bestOption.destination || 'None yet'}
              </div>
              <div className="flex justify-center mt-1">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${
                      index < bestOption.score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vacation Options */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Your Vacation Options</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {vacationOptions.map((option, index) => (
              <div key={option.vacation_number} className="space-y-4">
                <VacationCard
                  option={option}
                  onUpdate={updateVacationCard}
                  currency={currency}
                  vacationNumber={option.vacation_number}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resetVacationOption(option.vacation_number)}
                  className="w-full flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset Option {option.vacation_number}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <InternalLinks currentPage="vacation" />
        <SocialShare 
          title="Vacation Planning - Compare Options & Budgets"
          description="Plan your perfect vacation with our comparison tool. Compare costs, destinations, and find the best option for your budget."
        />
        <FAQ faqs={vacationPlanningFAQs} />
      </div>

      <AIChatbot 
        pageContext="vacation planning and comparison"
        pageName="Vacation Planning"
      />
    </div>
  );
};

export default Vacation;
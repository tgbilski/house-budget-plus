import React, { useState, useEffect, useCallback } from 'react';
import { Edit3, Star, Check, RefreshCw, Plane, Plus, AlertTriangle, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AIChatbot } from '@/components/AIChatbot';
import { SEO } from '@/components/SEO';
import { InternalLinks } from '@/components/InternalLinks';
import { SocialShare } from '@/components/SocialShare';
import { FAQ } from '@/components/FAQ';

import { WarningBanner } from '@/components/WarningBanner';
import { seoData } from '@/utils/seoData';

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
  family_friendly: boolean;
  good_weather: boolean;
  activities_available: boolean;
  affordable: boolean;
  relaxing: boolean;
  adventurous: boolean;
  memorable: boolean;
  created_at?: string;
  updated_at?: string;
}

interface VacationCardProps {
  option: VacationOption;
  onUpdate: (optionId: string, updates: Partial<VacationOption>) => Promise<void>;
  currency: any;
  vacationNumber: number;
}

const VacationCard: React.FC<VacationCardProps> = ({ option, onUpdate, currency, vacationNumber }) => {
  const [localOption, setLocalOption] = useState<VacationOption>(option);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setLocalOption(option);
  }, [option]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (JSON.stringify(localOption) !== JSON.stringify(option)) {
        onUpdate(option.id, localOption);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [localOption, option, onUpdate]);

  const updateField = (field: keyof VacationOption, value: any) => {
    setLocalOption(prev => ({ ...prev, [field]: value }));
  };

  const getEstimatedCost = () => {
    return (localOption.travel_mode_cost || 0) + (localOption.lodging_cost || 0) + (localOption.car_rental_cost || 0);
  };

  const getScoreCount = () => {
    const evaluationFields = [
      localOption.family_friendly,
      localOption.good_weather,
      localOption.activities_available,
      localOption.affordable,
      localOption.relaxing,
      localOption.adventurous,
      localOption.memorable
    ];
    return evaluationFields.filter(Boolean).length;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">Vacation {vacationNumber}</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {currency.symbol}{getEstimatedCost().toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Cost</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Destination</Label>
          <Input
            value={localOption.destination}
            onChange={(e) => updateField('destination', e.target.value)}
            placeholder="Where would you like to go?"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Travel Mode</Label>
            <Select value={localOption.travel_mode} onValueChange={(value) => updateField('travel_mode', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="How will you travel?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flight">Flight</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="train">Train</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium">Travel Cost</Label>
            <Input
              type="number"
              step="0.01"
              value={localOption.travel_mode_cost || ''}
              onChange={(e) => updateField('travel_mode_cost', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Lodging Cost</Label>
            <Input
              type="number"
              step="0.01"
              value={localOption.lodging_cost || ''}
              onChange={(e) => updateField('lodging_cost', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Car Rental Cost</Label>
            <Input
              type="number"
              step="0.01"
              value={localOption.car_rental_cost || ''}
              onChange={(e) => updateField('car_rental_cost', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full"
          >
            {isExpanded ? 'Hide Details' : 'Show Evaluation'}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Evaluation Criteria</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'family_friendly' as keyof VacationOption, label: 'Family Friendly' },
                  { key: 'good_weather' as keyof VacationOption, label: 'Good Weather' },
                  { key: 'activities_available' as keyof VacationOption, label: 'Activities' },
                  { key: 'affordable' as keyof VacationOption, label: 'Affordable' },
                  { key: 'relaxing' as keyof VacationOption, label: 'Relaxing' },
                  { key: 'adventurous' as keyof VacationOption, label: 'Adventurous' },
                  { key: 'memorable' as keyof VacationOption, label: 'Memorable' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Switch
                      checked={localOption[key] as boolean}
                      onCheckedChange={(checked) => updateField(key, checked)}
                    />
                    <Label className="text-sm">{label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Notes</Label>
              <Textarea
                value={localOption.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Additional notes about this option..."
                rows={3}
                className="mt-1 resize-none"
              />
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className={`h-5 w-5 ${
                      index < getScoreCount() ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                {getScoreCount()}/7 criteria met
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Vacation = () => {
  const [vacationOptions, setVacationOptions] = useState<VacationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentOptionId, setCurrentOptionId] = useState<string | null>(null);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editingDestination, setEditingDestination] = useState('');

  const { user } = useAuth();
  const { currency } = useCurrency();
  
  const currentOption = vacationOptions.find(opt => opt.id === currentOptionId);

  useEffect(() => {
    if (user) {
      loadVacationOptions();
    } else {
      initializeDemoOptions();
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (vacationOptions.length > 0 && !currentOptionId) {
      setCurrentOptionId(vacationOptions[0].id);
    }
  }, [vacationOptions, currentOptionId]);

  const loadVacationOptions = async () => {
    try {
      const { data: options, error: fetchError } = await supabase
        .from('vacation_options')
        .select('*')
        .eq('user_id', user?.id)
        .order('vacation_number', { ascending: true });

      if (fetchError) throw fetchError;

      // Create all 3 options if they don't exist
      const existingNumbers = options?.map(o => o.vacation_number) || [];
      const missingOptions = [];
      
      for (let i = 1; i <= 3; i++) {
        if (!existingNumbers.includes(i)) {
          missingOptions.push({
            user_id: user?.id,
            vacation_number: i,
            destination: '',
            travel_mode: '',
            travel_mode_cost: 0,
            lodging_cost: 0,
            car_rental_cost: 0,
            notes: '',
            family_friendly: false,
            good_weather: false,
            activities_available: false,
            affordable: false,
            relaxing: false,
            adventurous: false,
            memorable: false
          });
        }
      }

      if (missingOptions.length > 0) {
        const { data: newOptions, error: insertError } = await supabase
          .from('vacation_options')
          .insert(missingOptions)
          .select();
        
        if (insertError) throw insertError;
        
        const allOptions = [...(options || []), ...(newOptions || [])].sort((a, b) => a.vacation_number - b.vacation_number);
        setVacationOptions(allOptions);
        setCurrentOptionId(allOptions[0].id);
      } else {
        setVacationOptions(options);
        setCurrentOptionId(options[0].id);
      }
    } catch (error) {
      console.error('Error loading vacation options:', error);
      toast.error('Failed to load vacation options.');
    } finally {
      setLoading(false);
    }
  };

  const initializeDemoOptions = () => {
    const demoOptions = [
      { id: 'temp-1', user_id: 'guest', vacation_number: 1, destination: '', travel_mode: '', travel_mode_cost: 0, lodging_cost: 0, car_rental_cost: 0, notes: '', family_friendly: false, good_weather: false, activities_available: false, affordable: false, relaxing: false, adventurous: false, memorable: false },
      { id: 'temp-2', user_id: 'guest', vacation_number: 2, destination: '', travel_mode: '', travel_mode_cost: 0, lodging_cost: 0, car_rental_cost: 0, notes: '', family_friendly: false, good_weather: false, activities_available: false, affordable: false, relaxing: false, adventurous: false, memorable: false },
      { id: 'temp-3', user_id: 'guest', vacation_number: 3, destination: '', travel_mode: '', travel_mode_cost: 0, lodging_cost: 0, car_rental_cost: 0, notes: '', family_friendly: false, good_weather: false, activities_available: false, affordable: false, relaxing: false, adventurous: false, memorable: false }
    ];
    setVacationOptions(demoOptions);
    setCurrentOptionId(demoOptions[0].id);
  };

  const updateVacationCard = useCallback(async (optionId: string, updates: Partial<VacationOption>) => {
    // Update local state immediately
    setVacationOptions(prev => prev.map(option => 
      option.id === optionId ? { ...option, ...updates } : option
    ));

    // If user is logged in, sync with database
    if (user && !optionId.startsWith('temp-')) {
      try {
        const { error } = await supabase
          .from('vacation_options')
          .update(updates)
          .eq('id', optionId);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating vacation option:', error);
        toast.error('Failed to save changes');
        // Revert local changes on error
        loadVacationOptions();
      }
    }
  }, [user]);

  const resetVacationOption = async (vacationNumber: number) => {
    const option = vacationOptions.find(opt => opt.vacation_number === vacationNumber);
    if (!option) return;

    const resetData = {
      destination: '',
      travel_mode: '',
      travel_mode_cost: 0,
      lodging_cost: 0,
      car_rental_cost: 0,
      notes: '',
      family_friendly: false,
      good_weather: false,
      activities_available: false,
      affordable: false,
      relaxing: false,
      adventurous: false,
      memorable: false
    };

    await updateVacationCard(option.id, resetData);
    toast.success(`Vacation ${vacationNumber} has been reset`);
  };

  const getTotalBudget = () => {
    return vacationOptions.reduce((total, option) => {
      return total + (option.travel_mode_cost || 0) + (option.lodging_cost || 0) + (option.car_rental_cost || 0);
    }, 0);
  };

  const handleDestinationEdit = (option: VacationOption) => {
    setEditingOptionId(option.id);
    setEditingDestination(option.destination);
  };

  const handleDestinationSave = async () => {
    if (editingOptionId && editingDestination.trim()) {
      await updateVacationCard(editingOptionId, { destination: editingDestination.trim() });
    }
    setEditingOptionId(null);
    setEditingDestination('');
  };

  const handleDestinationCancel = () => {
    setEditingOptionId(null);
    setEditingDestination('');
  };

  const getBestOption = () => {
    const optionsWithScores = vacationOptions.map(option => {
      const evaluationFields = [
        option.family_friendly,
        option.good_weather,
        option.activities_available,
        option.affordable,
        option.relaxing,
        option.adventurous,
        option.memorable
      ];
      const score = evaluationFields.filter(Boolean).length;
      return { ...option, score };
    });

    if (optionsWithScores.length === 0) {
      return { destination: '', score: 0, travel_mode_cost: 0, lodging_cost: 0, car_rental_cost: 0 };
    }

    return optionsWithScores.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  };

  const vacationPlanningFAQs = [
    {
      question: "How do I compare vacation options effectively?",
      answer: "Use our vacation comparison tool to evaluate different destinations based on cost, activities, weather, and personal preferences. Fill out the evaluation criteria for each option to get a comprehensive comparison."
    },
    {
      question: "What costs should I include in my vacation budget?",
      answer: "Include travel costs (flights, gas, train tickets), lodging (hotels, rentals), transportation at destination (car rental, public transit), food, activities, and shopping. Don't forget to budget for unexpected expenses."
    },
    {
      question: "How far in advance should I plan my vacation?",
      answer: "For the best deals and availability, start planning 3-6 months in advance for domestic trips and 6-12 months for international travel. This allows time to research, save money, and book accommodations."
    },
    {
      question: "How can I save money on vacation planning?",
      answer: "Book flights and accommodations early, travel during off-peak seasons, look for package deals, use travel rewards credit cards, and consider alternative accommodations like vacation rentals."
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center">Loading vacation options...</div>
      </div>
    );
  }

  const bestOption = getBestOption();

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title={seoData.vacation.title}
        description={seoData.vacation.description}
        keywords={seoData.vacation.keywords}
        canonical="/vacation"
      />

      {/* Modern Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plane className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vacation Planner</h1>
                <p className="text-sm text-gray-600">Plan and budget your dream getaways</p>
              </div>
            </div>
            
            {bestOption && ((bestOption.travel_mode_cost || 0) + (bestOption.lodging_cost || 0) + (bestOption.car_rental_cost || 0)) > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Top Choice Budget</div>
                <div className="text-2xl font-bold text-primary">
                  {currency.symbol}{((bestOption.travel_mode_cost || 0) + (bestOption.lodging_cost || 0) + (bestOption.car_rental_cost || 0)).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumbs />
        
        <WarningBanner />

        {!user && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Demo Mode</strong> - 
              <Link to="/auth" className="underline font-medium ml-1 hover:text-yellow-900">
                Sign in to save your vacation plans
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Vacation Options Selector */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-2">
              {vacationOptions.map((option) => (
                <div key={option.vacation_number} className="w-full">
                  <div 
                    className={cn(
                      "group relative cursor-pointer transition-all w-full",
                      currentOptionId === option.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-muted/80",
                      "rounded-lg px-4 py-3 border-2",
                      currentOptionId === option.id && "border-primary",
                      currentOptionId !== option.id && "border-transparent hover:border-muted-foreground/20"
                    )}
                    onClick={() => setCurrentOptionId(option.id)}
                  >
                    <div className="flex items-center justify-between min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        {editingOptionId === option.id ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={editingDestination}
                              onChange={(e) => setEditingDestination(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleDestinationSave();
                                if (e.key === 'Escape') handleDestinationCancel();
                              }}
                              className="text-lg font-semibold bg-background text-foreground h-8"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleDestinationSave}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleDestinationCancel}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-lg font-semibold">
                              {option.destination || `Vacation ${option.vacation_number}`}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDestinationEdit(option);
                              }}
                              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                      <div className="text-sm opacity-75">
                        {currency.symbol}{((option.travel_mode_cost || 0) + (option.lodging_cost || 0) + (option.car_rental_cost || 0)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Option Details */}
        {currentOption && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                {currentOption.destination || `Vacation ${currentOption.vacation_number}`} Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VacationCard
                option={currentOption}
                onUpdate={updateVacationCard}
                currency={currency}
                vacationNumber={currentOption.vacation_number}
              />
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resetVacationOption(currentOption.vacation_number)}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset Option
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
// src/pages/Vacation.tsx
import React from 'react';
import { Plane, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button'; // The missing import
import { useAuth } from '@/hooks/useAuth';
import { useYear } from '@/hooks/useYear';
import { useCurrency } from '@/hooks/useCurrency';
import { YearSelector } from '@/components/YearSelector';
import { SEO } from '@/components/SEO';
import { WarningBanner } from '@/components/WarningBanner';
import { seoData } from '@/utils/seoData';
import { useVacationPlanner } from '@/hooks/useVacationPlanner';
import { VacationOptionCard } from '@/components/VacationOptionCard';
import { VacationSelector } from '@/components/VacationSelector';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const Vacation: React.FC = () => {
  const { user } = useAuth();
  const { selectedYear } = useYear();
  const { currency } = useCurrency();

  const {
    vacations,
    options,
    currentVacationId,
    isLoading,
    editingState,
    setCurrentVacationId,
    setEditingState,
    addOption,
    removeOption,
    updateOption,
    updateVacationTitle,
  } = useVacationPlanner({ user, year: selectedYear });

  if (isLoading) {
    return <div className="p-8 text-center">Planning your getaways...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title={seoData.vacation.title} description={seoData.vacation.description} keywords="vacation planning, travel budget, destination comparison" />
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Year selector at top right on laptop */}
          <div className="hidden lg:flex justify-end mb-4">
            <YearSelector />
          </div>
          
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <Plane className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vacation Planner</h1>
                <p className="text-sm text-gray-600">Compare options for each of your trips</p>
              </div>
            </div>
            
            {/* Year selector for mobile/tablet */}
            <div className="lg:hidden flex justify-center w-full">
              <YearSelector />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <WarningBanner />

         {!user && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Demo Mode</strong> -
              <Link to="/auth" className="underline font-medium ml-1 hover:text-yellow-900">
                Sign in to save your vacation plans
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <VacationSelector
          vacations={vacations}
          currentVacationId={currentVacationId}
          onSelectVacation={setCurrentVacationId}
          editingState={editingState}
          onSetEditingState={setEditingState}
          onUpdateTitle={updateVacationTitle}
        />

        <div className="flex justify-end">
          <Button onClick={addOption} className="gap-2"><Plus className="h-4 w-4" /> Add Destination Option</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {options.map((option) => (
            <VacationOptionCard
              key={option.id}
              option={option}
              onUpdate={(optionId, updates) => {
                const updatedOption = { ...option, ...updates };
                updateOption(updatedOption);
              }}
              onReset={removeOption}
              currencySymbol={currency.symbol}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Vacation;

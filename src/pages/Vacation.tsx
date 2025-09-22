// src/pages/Vacation.tsx
import React from 'react';
import { Plane } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useYear } from '@/hooks/useYear';
import { useCurrency } from '@/hooks/useCurrency';
import { YearSelector } from '@/components/YearSelector';
import { SEO } from '@/components/SEO';
import { WarningBanner } from '@/components/WarningBanner';
import { seoData } from '@/utils/seoData';
import { useVacationPlanner } from '@/hooks/useVacationPlanner';
import { VacationCard } from '@/components/VacationCard';
import { VacationSelector } from '@/components/VacationSelector';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const Vacation: React.FC = () => {
  const { user } = useAuth();
  const { selectedYear } = useYear();
  const { currency } = useCurrency();

  const {
    options,
    isLoading,
    currentOption,
    currentOptionId,
    editingState,
    setCurrentOptionId,
    setEditingState,
    updateVacationOption,
    updateDestinationTitle,
    resetVacationOption,
  } = useVacationPlanner({ user, year: selectedYear });

  if (isLoading) {
    return <div className="p-8 text-center">Planning your getaways...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title={seoData.vacation.title} description={seoData.vacation.description} />
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plane className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vacation Planner</h1>
              <p className="text-sm text-gray-600">Plan and budget your dream getaways</p>
            </div>
          </div>
          <YearSelector />
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
          options={options}
          currentOptionId={currentOptionId}
          onSelectOption={setCurrentOptionId}
          editingState={editingState}
          onSetEditingState={setEditingState}
          onUpdateTitle={updateDestinationTitle}
        />

        {currentOption && (
          <VacationCard
            key={currentOption.id}
            option={currentOption}
            onUpdate={updateVacationOption}
            onReset={resetVacationOption}
            currencySymbol={currency.symbol}
          />
        )}
      </div>
    </div>
  );
};

export default Vacation;

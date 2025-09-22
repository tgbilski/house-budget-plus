// src/pages/Vacation.tsx
import React from 'react';
import { Plane, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useYear } from '@/hooks/useYear';
import { useCurrency } from '@/hooks/useCurrency';
import { YearSelector } from '@/components/YearSelector';
import { SEO } from '@/components/SEO';
import { WarningBanner } from '@/components/WarningBanner';
import { seoData } from '@/utils/seoData';
import { useVacationPlanner } from '@/hooks/useVacationPlanner';
import { VacationOptionCard } from '@/components/VacationOptionCard'; // Renaming for clarity
import { VacationSelector } from '@/components/VacationSelector';

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
      <SEO title={seoData.vacation.title} description={seoData.vacation.description} />
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plane className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vacation Planner</h1>
              <p className="text-sm text-gray-600">Compare options for each of your trips</p>
            </div>
          </div>
          <YearSelector />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <WarningBanner />

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
              onUpdate={updateOption}
              onRemove={removeOption}
              showRemove={options.length > 1}
              currencySymbol={currency.symbol}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Vacation;

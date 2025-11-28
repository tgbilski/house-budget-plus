// src/pages/Vacation.tsx
import React, { useEffect, useState } from 'react';
import { Plane, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBadges } from '@/hooks/useBadges';
import { useYear } from '@/hooks/useYear';
import { useCurrency } from '@/hooks/useCurrency';
import { YearSelector } from '@/components/YearSelector';
import { SEO } from '@/components/SEO';
import { WarningBanner } from '@/components/WarningBanner';
import { VacationSummaryCard } from '@/components/VacationSummaryCard';
import { seoData } from '@/utils/seoData';
import { useVacationPlanner } from '@/hooks/useVacationPlanner';
import { VacationOptionCard } from '@/components/VacationOptionCard';
import { InternalLinks } from '@/components/InternalLinks';
import { FAQ } from '@/components/FAQ';
import { vacationPlanningFAQs } from '@/utils/faqData';
import heroVacationImg from '@/assets/hero-vacation.png';

const Vacation: React.FC = () => {
  const { user } = useAuth();
  const { selectedYear } = useYear();
  const { currency } = useCurrency();
  const { earnBadge } = useBadges();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const {
    vacations,
    options,
    currentVacationId,
    isLoading,
    setCurrentVacationId,
    addOption,
    removeOption,
    updateOption,
    updateVacationTitle,
  } = useVacationPlanner({ user, year: selectedYear });

  // Award badge when user has vacation options
  useEffect(() => {
    if (user && options.length > 0) {
      earnBadge('vacation');
    }
  }, [user, options.length, earnBadge]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-lg text-muted-foreground">Planning your getaways...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={seoData.vacation.title} 
        description={seoData.vacation.description} 
        keywords={seoData.vacation.keywords}
        canonical={seoData.vacation.canonical}
        ogImage={seoData.vacation.ogImage}
        structuredData={seoData.vacation.structuredData}
      />
      
      <div className="max-w-7xl mx-auto p-4">
        {/* Enhanced header with background image */}
        <div className="relative overflow-hidden rounded-2xl mb-6 shadow-lg">
          <img 
            src={heroVacationImg} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
          <div className="relative p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col lg:items-start space-y-2">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal to-teal/60 rounded-2xl shadow-lg">
                    <Plane className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-teal bg-clip-text text-transparent">
                      Vacation Planner
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                      Compare options for each of your trips
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Year selector at top right on laptop, centered on mobile */}
              <div className="flex justify-center lg:justify-end">
                <YearSelector />
              </div>
            </div>
          </div>
        </div>

        <WarningBanner />

        <div className="space-y-6">
          {/* Combined Summary Card with carousel, dates, and stats */}
          <VacationSummaryCard
            vacations={vacations}
            currentVacationId={currentVacationId}
            options={options}
            currencySymbol={currency.symbol}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onSelectVacation={setCurrentVacationId}
            onUpdateTitle={updateVacationTitle}
          />

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button 
              onClick={() => navigate('/marketplace')} 
              variant="outline" 
              className="gap-2"
            >
              <MapPin className="h-4 w-4" /> Explore Destinations
            </Button>
            <Button onClick={addOption} className="gap-2 bg-teal hover:bg-teal/90 text-teal-foreground">
              <Plus className="h-4 w-4" /> Add Destination Option
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {options.map((option, index) => (
              <div
                key={option.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
              >
                <VacationOptionCard
                  option={option}
                  onUpdate={(optionId, updates) => {
                    const updatedOption = { ...option, ...updates };
                    updateOption(updatedOption);
                  }}
                  onReset={removeOption}
                  currencySymbol={currency.symbol}
                />
              </div>
            ))}
          </div>

          <FAQ faqs={vacationPlanningFAQs} title="Vacation Planning FAQs" />

          <InternalLinks currentPage="/vacation" category="planning" />
        </div>
      </div>
    </div>
  );
};

export default Vacation;

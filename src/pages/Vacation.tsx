// src/pages/Vacation.tsx
import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useBadges } from '@/hooks/useBadges';
import { useYear } from '@/hooks/useYear';
import { useCurrency } from '@/hooks/useCurrency';
import { usePageReady } from '@/hooks/usePageReady';
import { YearSelector } from '@/components/YearSelector';
import { SEO } from '@/components/SEO';
import { WarningBanner } from '@/components/WarningBanner';
import { VacationSummaryCard } from '@/components/VacationSummaryCard';
import { seoData } from '@/utils/seoData';
import { useVacationPlanner } from '@/hooks/useVacationPlanner';
import { VacationOptionCard } from '@/components/VacationOptionCard';
import { InternalLinks } from '@/components/InternalLinks';
import { FAQ } from '@/components/FAQ';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { vacationPlanningFAQs } from '@/utils/faqData';
import { PageSEOContent, pageSEOData } from '@/components/PageSEOContent';
import calculatorMascot from '@/assets/calculator-mascot.png';

const Vacation: React.FC = () => {
  const { user } = useAuth();
  const { selectedYear } = useYear();
  const { currency } = useCurrency();
  const { earnBadge } = useBadges();
  const { setPageReady } = usePageReady();

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

  // Signal page is ready once data loads
  useEffect(() => {
    if (!isLoading) {
      requestAnimationFrame(() => {
        setPageReady();
      });
    }
  }, [isLoading, setPageReady]);

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
      
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-2">
        {/* Header - matching Monthly Budget style */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img 
                src={calculatorMascot} 
                alt="Budget Calculator Mascot" 
                className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 flex-shrink-0 object-contain"
              />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-wide truncate">
                COMPARE VACATIONS
              </h1>
            </div>
            {/* Desktop year selector */}
            <div className="hidden sm:block flex-shrink-0 bg-card border border-border rounded-xl p-2 sm:p-3 shadow-sm">
              <p className="text-xs text-muted-foreground mb-1 text-center">Budget Year</p>
              <YearSelector />
            </div>
          </div>
          {/* Mobile year selector - separate row */}
          <div className="sm:hidden bg-card border border-border rounded-xl p-2 shadow-sm w-full">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Budget Year</p>
              <YearSelector />
            </div>
          </div>
        </div>

        <WarningBanner />

        <div className="space-y-6">
          {/* Combined Summary Card with carousel and stats */}
          <VacationSummaryCard
            vacations={vacations}
            currentVacationId={currentVacationId}
            options={options}
            currencySymbol={currency.symbol}
            onSelectVacation={setCurrentVacationId}
            onUpdateTitle={updateVacationTitle}
          />

          <div className="flex justify-end">
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

          {user && <BadgeDisplay />}
          
          <FAQ faqs={vacationPlanningFAQs} title="Vacation Planning FAQs" />

          <InternalLinks currentPage="/vacation" category="planning" />
          
          <PageSEOContent
            title={pageSEOData.vacation.title}
            description={pageSEOData.vacation.description}
            features={pageSEOData.vacation.features}
            keywords={pageSEOData.vacation.keywords}
            premiumTitle={pageSEOData.vacation.premiumTitle}
            premiumDescription={pageSEOData.vacation.premiumDescription}
            premiumFeatures={pageSEOData.vacation.premiumFeatures}
          />
        </div>
      </div>
    </div>
  );
};

export default Vacation;

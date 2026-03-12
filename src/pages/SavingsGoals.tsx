// src/pages/SavingsGoals.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { useSavingsTracker } from '@/hooks/useSavingsTracker';
import { useCurrency } from '@/hooks/useCurrency';

import { usePageReady } from '@/hooks/usePageReady';
import { isNativeApp } from '@/utils/capacitor';
import { cn } from '@/lib/utils';

import { MonthlySavingsGrid } from '@/components/MonthlySavingsGrid';
import { CumulativeSavingsChart } from '@/components/CumulativeSavingsChart';
import { VoiceAddSection, ParsedEntry } from '@/components/VoiceAddSection';

import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { WarningBanner } from '@/components/WarningBanner';
import { InternalLinks } from '@/components/InternalLinks';
import { FAQ } from '@/components/FAQ';

import { PageSEOContent, pageSEOData } from '@/components/PageSEOContent';
import calculatorMascot from '@/assets/calculator-mascot.png';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const SavingsGoals: React.FC = () => {
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const { currentHousehold } = useHouseholdContext();
  const { currency } = useCurrency();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  
  const { setPageReady } = usePageReady();
  const isMobileApp = isNativeApp();

  const {
    goals,
    currentGoal,
    currentGoalId,
    monthlyData,
    totalSaved,
    isLoading,
    editingState,
    setEditingState,
    setCurrentGoalId,
    updateGoal,
    updateMonthlyAmount,
  } = useSavingsTracker({ user, currentHousehold, year: selectedYear });
  
  const progressPercentage = currentGoal?.target_amount ? Math.min((totalSaved / currentGoal.target_amount) * 100, 100) : 0;

  useEffect(() => {
    if (!isLoading) {
      requestAnimationFrame(() => {
        setPageReady();
      });
    }
  }, [isLoading, setPageReady]);

  // Voice save handlers
  const handleVoiceSaveSavings = async (entry: ParsedEntry, transcription: string) => {
    // Use current month if AI didn't detect a specific month
    const monthIndex = entry.month ? entry.month - 1 : new Date().getMonth();
    await updateMonthlyAmount(monthIndex, entry.amount);
    toast({ title: 'Saved!', description: `${currency.symbol}${entry.amount} added to ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][monthIndex]} savings` });
  };

  const handleVoiceSaveExpense = async (entry: ParsedEntry, transcription: string) => {
    toast({ title: 'Expense detected!', description: 'Redirecting to expenses page...' });
    navigate('/expenses');
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading your savings goals...</div>;
  }

  return (
    <div className={cn(
      isMobileApp ? "" : "min-h-screen"
    )}>
      <SEO
        title={seoData.savingsGoals.title}
        description={seoData.savingsGoals.description}
        keywords={seoData.savingsGoals.keywords}
        canonical={seoData.savingsGoals.canonical}
        ogImage={seoData.savingsGoals.ogImage}
        structuredData={seoData.savingsGoals.structuredData}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 pt-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img 
              src={calculatorMascot} 
              alt="Budget Calculator Mascot" 
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 flex-shrink-0 object-contain"
            />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-wide truncate">
              SAVINGS GOALS
            </h1>
          </div>
        </div>

        <WarningBanner />

        <div className="space-y-8">
          {/* Voice Add Section - Premium only */}
          {subscribed && user && (
            <VoiceAddSection
              context="savings"
              onSaveExpense={handleVoiceSaveExpense}
              onSaveSavings={handleVoiceSaveSavings}
            />
          )}

          {/* Chart with integrated goal selection */}
          <CumulativeSavingsChart
            monthlyData={monthlyData}
            goals={goals}
            currentGoalId={currentGoalId}
            totalSaved={totalSaved}
            progressPercentage={progressPercentage}
            onSelectGoal={setCurrentGoalId}
            editingState={editingState}
            onSetEditingState={setEditingState}
            onUpdateGoal={updateGoal}
          />

          <MonthlySavingsGrid
            year={selectedYear.toString()}
            onYearChange={year => setSelectedYear(parseInt(year))}
            monthlyData={monthlyData}
            onUpdateAmount={updateMonthlyAmount}
          />

          {!isMobileApp && (
            <>
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <FAQ 
                  faqs={[
                    {
                      question: "How do I set a savings goal?",
                      answer: "Click on the goal name at the top of the chart to edit it. You can set a name and target amount for your goal."
                    },
                    {
                      question: "Can I track multiple savings goals at once?",
                      answer: "Yes! Use the left and right arrows on the chart to switch between your goals. You can have up to 3 savings goals."
                    },
                    {
                      question: "How do I update my monthly savings?",
                      answer: "Use the slider or type directly in the amount field for any month. You can also use the Voice Quick Add feature (premium) to speak your savings entries."
                    },
                    {
                      question: "What happens if I save more than my target?",
                      answer: "Great job! The progress tracker will show 100% when you reach your target. You can continue adding monthly savings and either increase your target or create a new goal."
                    }
                  ]}
                  title="Savings Goals FAQs"
                />
              </div>

              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <InternalLinks currentPage="/savings" category="planning" />
              </div>
              
              <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <PageSEOContent
                  title={pageSEOData.savingsGoals.title}
                  description={pageSEOData.savingsGoals.description}
                  features={pageSEOData.savingsGoals.features}
                  keywords={pageSEOData.savingsGoals.keywords}
                  premiumTitle={pageSEOData.savingsGoals.premiumTitle}
                  premiumDescription={pageSEOData.savingsGoals.premiumDescription}
                  premiumFeatures={pageSEOData.savingsGoals.premiumFeatures}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavingsGoals;

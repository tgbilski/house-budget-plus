// src/pages/SavingsGoals.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { useSavingsTracker } from '@/hooks/useSavingsTracker';
import { useBadges } from '@/hooks/useBadges';
import { isNativeApp } from '@/utils/capacitor';
import { cn } from '@/lib/utils';

import { MonthlySavingsGrid } from '@/components/MonthlySavingsGrid';
import { CumulativeSavingsChart } from '@/components/CumulativeSavingsChart';

import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { WarningBanner } from '@/components/WarningBanner';
import { InternalLinks } from '@/components/InternalLinks';
import { FAQ } from '@/components/FAQ';
import calculatorMascot from '@/assets/calculator-mascot.png';

const SavingsGoals: React.FC = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  // Local year state - independent from other pages, defaults to 2025
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const { earnBadge } = useBadges();
  const isMobileApp = isNativeApp();

  const {
    goals,
    currentGoal,
    currentGoalId,
    monthlyData,
    totalSaved, // Total across ALL years for this goal
    isLoading,
    editingState,
    setEditingState,
    setCurrentGoalId,
    updateGoal,
    updateMonthlyAmount,
  } = useSavingsTracker({ user, currentHousehold, year: selectedYear });
  
  const progressPercentage = currentGoal?.target_amount ? Math.min((totalSaved / currentGoal.target_amount) * 100, 100) : 0;

  // Award badge when user has savings data
  useEffect(() => {
    if (user && (goals.length > 0 || totalSaved > 0)) {
      earnBadge('savings_tracker');
    }
  }, [user, goals.length, totalSaved, earnBadge]);

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

      <div className="max-w-7xl mx-auto pt-2 px-4 md:px-6 lg:px-8">
        {/* Header - matching Monthly Budget style */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img 
              src={calculatorMascot} 
              alt="Budget Calculator Mascot" 
              className="w-12 h-12 md:w-16 md:h-16 object-contain"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-wide">
              SAVINGS GOALS
            </h1>
          </div>
        </div>

        <WarningBanner />

        <div className="space-y-8">
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
                      answer: "Click on any month in the yearly grid and enter the amount you saved that month. The progress bar will automatically update to show your overall achievement toward the goal."
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavingsGoals;

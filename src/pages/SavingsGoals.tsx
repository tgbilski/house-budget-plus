// src/pages/SavingsGoals.tsx
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { useYear } from '@/hooks/useYear';
import { useSavingsTracker } from '@/hooks/useSavingsTracker';
import { useBadges } from '@/hooks/useBadges';
import { isNativeApp } from '@/utils/capacitor';
import { cn } from '@/lib/utils';

import { MonthlySavingsGrid } from '@/components/MonthlySavingsGrid';
import { CumulativeSavingsChart } from '@/components/CumulativeSavingsChart';

import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { AlertTriangle, Target } from 'lucide-react';
import { AIChatbot } from '@/components/AIChatbot';
import { YearSelector } from '@/components/YearSelector';
import { InternalLinks } from '@/components/InternalLinks';
import { FAQ } from '@/components/FAQ';

const SavingsGoals: React.FC = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { selectedYear, setSelectedYear } = useYear();
  const { earnBadge } = useBadges();
  const isMobileApp = isNativeApp();

  const {
    goals,
    currentGoal,
    currentGoalId,
    monthlyData,
    isLoading,
    editingState,
    setEditingState,
    setCurrentGoalId,
    updateGoal,
    updateMonthlyAmount,
  } = useSavingsTracker({ user, currentHousehold, year: selectedYear });
  
  const totalSaved = Object.values(monthlyData).reduce((sum, val) => sum + val, 0);
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
      "bg-gradient-to-br from-white via-background to-sage/10",
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

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Enhanced header with gradient background */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-border/50 shadow-[var(--shadow-elegant)] animate-fade-in">
          <div className="flex flex-col lg:items-start space-y-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal/20 to-teal-glow/20 rounded-2xl shadow-md">
                <Target className="h-8 w-8 text-teal" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-teal bg-clip-text text-transparent">
                  Savings Tracker
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Track your progress toward financial goals
                </p>
              </div>
            </div>
          </div>
          
          {/* Year selector at top right on laptop, centered on mobile */}
          <div className="flex justify-center lg:justify-end">
            <YearSelector />
          </div>
        </div>

        {!user && (
          <Alert className="border-2 border-warning/40 bg-warning/10 mb-8 backdrop-blur-sm animate-slide-up">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <AlertDescription className="text-foreground">
              <strong>Demo Mode</strong> - Your changes won't be saved.
              <Link to="/auth" className="underline font-medium ml-2 hover:text-teal transition-colors">
                Sign in to track your goals permanently
              </Link>
            </AlertDescription>
          </Alert>
        )}

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
                <AIChatbot
                  pageContext="I'm on the savings goals page where I can track my monthly savings progress toward financial goals."
                  pageName="Savings Goals"
                />
              </div>

              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
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

              <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
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

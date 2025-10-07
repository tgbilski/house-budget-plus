// src/pages/SavingsGoals.tsx
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { useYear } from '@/hooks/useYear'; // Import the useYear hook
import { useSavingsTracker } from '@/hooks/useSavingsTracker';
import { useBadges } from '@/hooks/useBadges';

// Import the worker components
import { GoalSelector } from '@/components/GoalSelector';
import { GoalProgressCard } from '@/components/GoalProgressCard';
import { MonthlySavingsGrid } from '@/components/MonthlySavingsGrid';

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
  const { selectedYear, setSelectedYear } = useYear(); // Get the year and its setter function
  const { earnBadge } = useBadges();

  // Call the hook with all the props it needs, including the year
  const {
    goals,
    currentGoal,
    currentGoalId,
    monthlyData,
    isLoading,
    editingState,      // Correct name
    setEditingState,   // Correct name
    setCurrentGoalId,
    updateGoalTitle,
    updateGoalTarget,
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
    <div className="min-h-screen bg-background">
      <SEO
        title={seoData.savingsGoals.title}
        description={seoData.savingsGoals.description}
        keywords={seoData.savingsGoals.keywords}
        canonical={seoData.savingsGoals.canonical}
        ogImage={seoData.savingsGoals.ogImage}
        structuredData={seoData.savingsGoals.structuredData}
      />

      <div className="max-w-7xl mx-auto p-4">
        {/* Compact header at very top */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex flex-col lg:items-start space-y-2">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-teal/20 rounded-full">
                <Target className="h-6 w-6 text-teal" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Savings Tracker</h1>
            </div>
            <p className="text-muted-foreground text-sm text-center lg:text-left bg-sage/30 px-3 py-1 rounded-md">
              Track your progress toward financial goals
            </p>
          </div>
          
          {/* Year selector at top right on laptop, centered on mobile */}
          <div className="flex justify-center lg:justify-end">
            <YearSelector />
          </div>
        </div>

        {!user && (
          <Alert className="border-yellow-200 bg-yellow-50 mb-6">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Demo Mode</strong> -
              <Link to="/auth" className="underline font-medium ml-1 hover:text-yellow-900">
                Sign in to save your progress
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <GoalSelector
            goals={goals}
            currentGoalId={currentGoalId}
            onSelectGoal={setCurrentGoalId}
            editingState={editingState}
            onSetEditingState={setEditingState}
            onUpdateTitle={updateGoalTitle}
          />

          <GoalProgressCard
            currentGoal={currentGoal}
            totalSaved={totalSaved}
            progressPercentage={progressPercentage}
            onUpdateTarget={updateGoalTarget}
          />

          <MonthlySavingsGrid
            year={selectedYear.toString()}
            onYearChange={year => setSelectedYear(parseInt(year))}
            monthlyData={monthlyData}
            onUpdateAmount={updateMonthlyAmount}
          />

          <AIChatbot
            pageContext="I'm on the savings goals page where I can track my monthly savings progress toward financial goals."
            pageName="Savings Goals"
          />

          <FAQ 
            faqs={[
              {
                question: "How do I set a savings goal?",
                answer: "Click on the goal selector dropdown at the top of the page. You can create new goals or select existing ones. Enter your target amount and goal name to get started."
              },
              {
                question: "Can I track multiple savings goals at once?",
                answer: "Yes! You can create multiple savings goals (like 'Emergency Fund', 'Vacation', 'New Car') and switch between them to track progress for each one separately."
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

          <InternalLinks currentPage="/savings" category="planning" />
        </div>
      </div>
    </div>
  );
};

export default SavingsGoals;

// src/pages/SavingsGoals.tsx
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { useYear } from '@/hooks/useYear'; // Import the useYear hook
import { useSavingsTracker } from '@/hooks/useSavingsTracker';

// Import the worker components
import { GoalSelector } from '@/components/GoalSelector';
import { GoalProgressCard } from '@/components/GoalProgressCard';
import { MonthlySavingsGrid } from '@/components/MonthlySavingsGrid';

import { SEO } from '@/components/SEO';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { AlertTriangle, Target } from 'lucide-react';
import { AIChatbot } from '@/components/AIChatbot';
import { YearSelector } from '@/components/YearSelector'; // We need this for the header

const SavingsGoals: React.FC = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { selectedYear, setSelectedYear } = useYear(); // Get the year and its setter function

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

  if (isLoading) {
    return <div className="p-8 text-center">Loading your savings goals...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Savings Goals - Track Your Monthly Savings"
        description="Track your monthly savings with an interactive yearly table and editable goals."
      />

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Savings Tracker</h1>
                <p className="text-sm text-gray-600">Track your progress toward financial goals</p>
              </div>
            </div>
            <YearSelector />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {!user && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Demo Mode</strong> -
              <Link to="/auth" className="underline font-medium ml-1 hover:text-yellow-900">
                Sign in to save your progress
              </Link>
            </AlertDescription>
          </Alert>
        )}

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
      </div>
    </div>
  );
};

export default SavingsGoals;

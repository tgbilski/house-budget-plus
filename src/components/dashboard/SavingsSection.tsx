import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { useSavingsTracker } from '@/hooks/useSavingsTracker';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCurrency } from '@/hooks/useCurrency';
import { MonthlySavingsGrid } from '@/components/MonthlySavingsGrid';
import { CumulativeSavingsChart } from '@/components/CumulativeSavingsChart';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const SavingsSection: React.FC = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { currency } = useCurrency();
  const isMobile = useIsMobile();
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [expanded, setExpanded] = useState(!isMobile);

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

  const progressPercentage = currentGoal?.target_amount
    ? Math.min((totalSaved / currentGoal.target_amount) * 100, 100)
    : 0;

  if (!user || isLoading) return null;

  // Mobile: card-based
  if (isMobile) {
    return (
      <section className="animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <button onClick={() => setExpanded(!expanded)} className="w-full touch-manipulation">
          <div className="bg-card border-[3px] border-stroke rounded-xl p-4 shadow-cartoon">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <span className="text-lg">🎯</span>
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Savings Goals</h2>
                  {currentGoal ? (
                    <div>
                      <p className="text-lg font-bold text-success">{currency.symbol}{totalSaved.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        of {currency.symbol}{currentGoal.target_amount.toLocaleString()} — {progressPercentage.toFixed(0)}%
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Set up a savings goal</p>
                  )}
                </div>
              </div>
              {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>

            {/* Progress bar in collapsed state */}
            {!expanded && currentGoal && currentGoal.target_amount > 0 && (
              <div className="mt-3">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-success rounded-full h-2 transition-all duration-500" 
                    style={{ width: `${progressPercentage}%` }} 
                  />
                </div>
              </div>
            )}
          </div>
        </button>

        {expanded && (
          <div className="mt-3 space-y-4 animate-fade-in">
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
              onYearChange={y => setSelectedYear(parseInt(y))}
              monthlyData={monthlyData}
              onUpdateAmount={updateMonthlyAmount}
            />
          </div>
        )}
      </section>
    );
  }

  // Desktop: full section
  return (
    <section className="animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold text-foreground tracking-wide">SAVINGS GOALS</h2>
      </div>

      <div className="space-y-6">
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
          onYearChange={y => setSelectedYear(parseInt(y))}
          monthlyData={monthlyData}
          onUpdateAmount={updateMonthlyAmount}
        />
      </div>
    </section>
  );
};

export default SavingsSection;

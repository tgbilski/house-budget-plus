import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { useSubscription } from '@/hooks/useSubscription';

import { useCurrency } from '@/hooks/useCurrency';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BudgetCalculator from '@/components/BudgetCalculator';
import { BudgetDonutChart } from '@/components/BudgetDonutChart';
import { PremiumLimitBanner } from '@/components/PremiumLimitBanner';
import { InsightsDashboard } from '@/components/InsightsDashboard';
import { AISavingsTeaser } from '@/components/AISavingsTeaser';
import { MortgagePreapprovalCard } from '@/components/MortgagePreapprovalCard';
import InlineSignUpForm from '@/components/InlineSignUpForm';
import { cn } from '@/lib/utils';

const BudgetSection: React.FC = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold(user?.id);
  const { subscribed } = useSubscription();
  
  const { currency } = useCurrency();
  const isMobile = useIsMobile();

  const [budgetData, setBudgetData] = useState<Record<string, { income: number; expenses: number; housingExpense: number }>>({});
  const [calculatorNames, setCalculatorNames] = useState<Record<string, string>>({});
  const [visibleCalculators, setVisibleCalculators] = useState<Set<string>>(new Set(['1']));
  const [expanded, setExpanded] = useState(!isMobile);

  const totalIncome = Object.values(budgetData).reduce((sum, d) => sum + (d.income || 0), 0);
  const totalExpenses = Object.values(budgetData).reduce((sum, d) => sum + (d.expenses || 0), 0);
  const totalHousingExpense = Object.values(budgetData).reduce((sum, d) => sum + (d.housingExpense || 0), 0);
  const netBalance = totalIncome - totalExpenses;
  const yearlyHouseholdIncome = totalIncome * 12;

  const formatCurrency = (amount: number) => `${currency.symbol}${amount.toLocaleString()}`;

  useEffect(() => {
    const handler = (event: Event) => {
      if (event instanceof CustomEvent) {
        const { calculatorId, income, totalExpenses, housingExpense } = event.detail;
        setBudgetData(prev => ({
          ...prev,
          [calculatorId]: { income: income || 0, expenses: totalExpenses || 0, housingExpense: housingExpense || 0 }
        }));
      }
    };
    window.addEventListener('budgetUpdate', handler);
    return () => window.removeEventListener('budgetUpdate', handler);
  }, []);


  const { data: calculatorVisibility } = useQuery({
    queryKey: ['budget-calculators', user?.id, currentHousehold?.id],
    queryFn: async () => {
      if (!user || !currentHousehold) return null;
      const { data, error } = await supabase
        .from('budget_data')
        .select('calculator_id')
        .eq('user_id', user.id)
        .eq('household_id', currentHousehold.id)
        .eq('page_type', 'monthly_budget');
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!currentHousehold,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (calculatorVisibility && calculatorVisibility.length > 0) {
      const unique = [...new Set(calculatorVisibility.map(i => i.calculator_id))];
      setVisibleCalculators(new Set(['1', ...unique]));
    } else {
      setVisibleCalculators(new Set(['1']));
    }
  }, [calculatorVisibility, user, currentHousehold]);

  const revealNextCalculator = () => {
    const allIds = ['1', '2'];
    const next = allIds.find(id => !visibleCalculators.has(id));
    if (next) setVisibleCalculators(prev => new Set([...prev, next]));
  };

  const handleCalculatorReset = (calculatorId: string, isEmpty: boolean) => {
    if (calculatorId === '1') return;
    if (isEmpty) {
      setVisibleCalculators(prev => {
        const next = new Set(prev);
        next.delete(calculatorId);
        return next;
      });
    }
  };

  const getNextCalculatorNumber = () => {
    const allIds = ['1', '2'];
    const next = allIds.find(id => !visibleCalculators.has(id));
    return next ? parseInt(next) : null;
  };

  // Mobile: collapsible card showing snapshot
  if (isMobile) {
    return (
      <section className="animate-fade-in">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full touch-manipulation"
        >
          <div className="bg-card border-[3px] border-stroke rounded-xl p-4 shadow-cartoon">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">💰</span>
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Monthly Budget</h2>
                  {totalIncome > 0 ? (
                    <p className={cn(
                      "text-lg font-bold",
                      netBalance >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {netBalance >= 0 ? '+' : ''}{currency.symbol}{netBalance.toLocaleString()}/mo
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Tap to set up your budget</p>
                  )}
                </div>
              </div>
              {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>
            
            {totalIncome > 0 && !expanded && (
              <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                <span>Income: {currency.symbol}{totalIncome.toLocaleString()}</span>
                <span>Expenses: {currency.symbol}{totalExpenses.toLocaleString()}</span>
              </div>
            )}
          </div>
        </button>

        {expanded && (
          <div className="mt-3 space-y-4 animate-fade-in">
            {['1', '2', '3', '4'].filter(id => visibleCalculators.has(id)).map((id) => (
              <BudgetCalculator
                key={id}
                id={id}
                calculatorNumber={parseInt(id)}
                showRemove={false}
                onRemove={() => {}}
                onNameChange={(id, name) => setCalculatorNames(prev => ({ ...prev, [id]: name }))}
                pageType="monthly_budget"
                onEmptyStateChange={handleCalculatorReset}
              />
            ))}

            {getNextCalculatorNumber() && (
              subscribed || visibleCalculators.size < 2 ? (
                <button
                  onClick={revealNextCalculator}
                  className="w-full min-h-[120px] rounded-xl border-[3px] border-dashed border-border/50 bg-muted/20 touch-manipulation flex flex-col items-center justify-center gap-2"
                >
                  <Plus className="h-6 w-6 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Add Calculator {getNextCalculatorNumber()}</p>
                </button>
              ) : (
                <PremiumLimitBanner featureName="calculators" freeLimit={1} />
              )
            )}

            {/* Mortgage Preapproval on mobile */}
            {totalIncome > 0 && (
              <MortgagePreapprovalCard
                monthlyIncome={totalIncome}
                housingExpense={totalHousingExpense}
                totalExpenses={totalExpenses}
              />
            )}

            {/* AI Savings Teaser on mobile */}
            {!subscribed && totalExpenses > 100 && (
              <AISavingsTeaser
                totalExpenses={totalExpenses}
                monthlyIncome={totalIncome}
                formatCurrency={formatCurrency}
              />
            )}

            {/* AI Insights hidden for now - not working */}
          </div>
        )}
      </section>
    );
  }

  // Desktop: full section
  return (
    <section className="animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold text-foreground tracking-wide">MONTHLY BUDGET</h2>
      </div>

      {user ? (
        /* Authenticated: 3-column layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {['1', '2', '3', '4'].filter(id => visibleCalculators.has(id)).map((id, index) => (
              <div key={id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}>
                <BudgetCalculator
                  id={id}
                  calculatorNumber={parseInt(id)}
                  showRemove={false}
                  onRemove={() => {}}
                  onNameChange={(id, name) => setCalculatorNames(prev => ({ ...prev, [id]: name }))}
                  pageType="monthly_budget"
                  onEmptyStateChange={handleCalculatorReset}
                />
              </div>
            ))}

            {getNextCalculatorNumber() && (
              subscribed || visibleCalculators.size < 2 ? (
                <div className="animate-fade-in flex items-start">
                  <button
                    onClick={revealNextCalculator}
                    className="w-full max-w-md min-h-[200px] rounded-xl border-[4px] border-dashed border-border/50 bg-muted/20 touch-manipulation [@media(hover:hover)]:hover:bg-muted/40 [@media(hover:hover)]:hover:border-primary/50 transition-all duration-200 flex flex-col items-center justify-center gap-3 group"
                  >
                    <div className="p-3 rounded-full bg-primary/10 [@media(hover:hover)]:group-hover:bg-primary/20 transition-colors">
                      <Plus className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">Add Calculator {getNextCalculatorNumber()}</p>
                      <p className="text-sm text-muted-foreground">Track another income source</p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in flex items-start">
                  <PremiumLimitBanner 
                    featureName="calculators" 
                    freeLimit={1} 
                    className="min-h-[200px] flex flex-col items-center justify-center"
                  />
                </div>
              )
            )}
          </div>

          {/* Right column: income summary, donut chart, mortgage, AI insights */}
          <div className="lg:col-span-1 space-y-4">
            {totalIncome > 0 && (
              <div className="bg-card border-[3px] border-stroke rounded-xl p-4 shadow-cartoon">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Yearly Household Income</p>
                <p className="text-2xl sm:text-3xl font-bold text-success">
                  {currency.symbol}{yearlyHouseholdIncome.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {currency.symbol}{totalIncome.toLocaleString()}/month
                </p>
              </div>
            )}

            <BudgetDonutChart totalIncome={totalIncome} totalExpenses={totalExpenses} currency={currency} />

            {totalIncome > 0 && (
              <MortgagePreapprovalCard
                monthlyIncome={totalIncome}
                housingExpense={totalHousingExpense}
                totalExpenses={totalExpenses}
              />
            )}

            {!subscribed && totalExpenses > 100 && (
              <AISavingsTeaser
                totalExpenses={totalExpenses}
                monthlyIncome={totalIncome}
                formatCurrency={formatCurrency}
              />
            )}

            {/* AI Insights hidden for now - not working */}
          </div>
        </div>
      ) : (
        /* Guest: 2-column layout — calculator left, pitch + signup right */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-fade-in">
            <BudgetCalculator
              id="1"
              calculatorNumber={1}
              showRemove={false}
              onRemove={() => {}}
              onNameChange={(id, name) => setCalculatorNames(prev => ({ ...prev, [id]: name }))}
              pageType="monthly_budget"
              onEmptyStateChange={handleCalculatorReset}
            />
          </div>

          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
            {/* Sales pitch */}
            <div className="bg-card border-[3px] border-stroke rounded-xl p-5 shadow-cartoon">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Adulting is hard. Budgeting doesn't have to be. 😤
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                You're already crunching numbers — why not save your work?
              </p>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-lg leading-none">🔒</span>
                  <span className="text-foreground"><strong>Your data, saved forever</strong> — no more "what was my rent?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg leading-none">👯</span>
                  <span className="text-foreground"><strong>Add roommates & partners</strong> — split costs easily</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg leading-none">🧾</span>
                  <span className="text-foreground"><strong>Voice expense tracking</strong> — just speak it</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg leading-none">🎯</span>
                  <span className="text-foreground"><strong>Savings goals</strong> — watch your progress grow</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg leading-none">🏠</span>
                  <span className="text-foreground"><strong>Mortgage preapproval</strong> — know what you can afford</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground italic">
                No credit card needed. No spam. Just vibes and financial literacy. 🫡
              </p>
            </div>

            {/* Inline signup */}
            <InlineSignUpForm />
          </div>
        </div>
      )}
    </section>
  );
};

export default BudgetSection;

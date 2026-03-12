import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BudgetCalculator from '@/components/BudgetCalculator';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/hooks/useAuth';

import { useBadges } from '@/hooks/useBadges';
import { useHousehold } from '@/hooks/useHousehold';
import { useSubscription } from '@/hooks/useSubscription';
import { usePageReady } from '@/hooks/usePageReady';
import { supabase } from '@/integrations/supabase/client';

import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { budgetCalculatorFAQs } from '@/utils/faqData';
import { FAQ } from '@/components/FAQ';
import { BudgetDonutChart } from '@/components/BudgetDonutChart';
import { PageSEOContent, pageSEOData } from '@/components/PageSEOContent';
import { WarningBanner } from '@/components/WarningBanner';
import { ToolsGrid } from '@/components/ToolsGrid';
import InlineSignUpForm from '@/components/InlineSignUpForm';
import FeedbackForm from '@/components/FeedbackForm';
import { PremiumLimitBanner } from '@/components/PremiumLimitBanner';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import calculatorMascot from '@/assets/calculator-mascot.png';
// ADDED: Import the hook to detect mobile
import { useIsMobile } from '@/hooks/use-mobile';

interface Calculator {
  id: string;
}

const MonthlyBudget: React.FC = () => {
  const [calculators, setCalculators] = useState<Calculator[]>([]);
  const [budgetData, setBudgetData] = useState<Record<string, { income: number; expenses: number; housingExpense: number }>>({});
  const [calculatorNames, setCalculatorNames] = useState<Record<string, string>>({});
  
  const [visibleCalculators, setVisibleCalculators] = useState<Set<string>>(new Set(['1']));

  // ADDED: Hook call
  const isMobile = useIsMobile();

  const { currency } = useCurrency();
  const { user } = useAuth();
  const { earnBadge, loading: badgesLoading } = useBadges();
  const { currentHousehold } = useHousehold(user?.id);
  const { subscribed } = useSubscription();
  const { setPageReady } = usePageReady();

  const totalIncome = Object.values(budgetData).reduce((sum, data) => sum + (data.income || 0), 0);
  const totalExpenses = Object.values(budgetData).reduce((sum, data) => sum + (data.expenses || 0), 0);
  const totalHousingExpense = Object.values(budgetData).reduce((sum, data) => sum + (data.housingExpense || 0), 0);
  const netBalance = totalIncome - totalExpenses;
  const yearlyHouseholdIncome = totalIncome * 12;
  
  useEffect(() => {
    const handleBudgetUpdate = (event: Event) => {
      if (event instanceof CustomEvent) {
        const { calculatorId, income, totalExpenses, housingExpense } = event.detail;
        setBudgetData(prev => ({
          ...prev,
          [calculatorId]: { income: income || 0, expenses: totalExpenses || 0, housingExpense: housingExpense || 0 }
        }));
      }
    };

    window.addEventListener('budgetUpdate', handleBudgetUpdate);
    return () => window.removeEventListener('budgetUpdate', handleBudgetUpdate);
  }, []);

  useEffect(() => {
    const handleEarnBadge = (event: Event) => {
      // Don't process badge events while badges are still loading
      if (badgesLoading) return;
      
      if (event instanceof CustomEvent) {
        const { badgeType } = event.detail;
        earnBadge(badgeType);
      }
    };

    window.addEventListener('earnBadge', handleEarnBadge);
    return () => window.removeEventListener('earnBadge', handleEarnBadge);
  }, [earnBadge, badgesLoading]);

  const { data: calculatorVisibility, isLoading, error: queryError } = useQuery({
    queryKey: ['budget-calculators', user?.id, currentHousehold?.id],
    queryFn: async () => {
      if (!user || !currentHousehold) return null;
      
      const { data, error: dbError } = await supabase
        .from('budget_data')
        .select('calculator_id')
        .eq('user_id', user.id)
        .eq('household_id', currentHousehold.id)
        .eq('page_type', 'monthly_budget');

      if (dbError) throw dbError;
      return data;
    },
    enabled: !!user && !!currentHousehold,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    setCalculators([{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]);
    
    if (!user || !currentHousehold) {
      setVisibleCalculators(new Set(['1']));
      return;
    }

    if (calculatorVisibility && calculatorVisibility.length > 0) {
      const uniqueCalculators = [...new Set(calculatorVisibility.map(item => item.calculator_id))];
      setVisibleCalculators(new Set(['1', ...uniqueCalculators]));
    } else {
      setVisibleCalculators(new Set(['1']));
    }
  }, [calculatorVisibility, user, currentHousehold]);
  
  // Signal page is ready once initial data load completes
  useEffect(() => {
    if (!isLoading) {
      // Use requestAnimationFrame to ensure DOM is painted
      requestAnimationFrame(() => {
        setPageReady();
      });
    }
  }, [isLoading, setPageReady]);
  
  const error = queryError ? "Failed to load your budget data. Please refresh the page to try again." : null;

  const revealNextCalculator = () => {
    const allIds = ['1', '2', '3', '4'];
    const nextHidden = allIds.find(id => !visibleCalculators.has(id));
    if (nextHidden) {
      setVisibleCalculators(prev => new Set([...prev, nextHidden]));
    }
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
    const allIds = ['1', '2', '3', '4'];
    const nextHidden = allIds.find(id => !visibleCalculators.has(id));
    return nextHidden ? parseInt(nextHidden) : null;
  };

  const handleNameChange = (id: string, name: string) => {
    setCalculatorNames(prev => ({ ...prev, [id]: name }));
  };

  return (
    <div className="min-h-screen">
      <SEO
        title={seoData.monthlyBudget.title}
        description={seoData.monthlyBudget.description}
        keywords={seoData.monthlyBudget.keywords}
        structuredData={seoData.monthlyBudget.structuredData}
        canonical={seoData.monthlyBudget.canonical}
        ogImage={seoData.monthlyBudget.ogImage}
      />
      
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-2 pb-4">
        {/* Page Header */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img 
                src={calculatorMascot} 
                alt="Budget Calculator Mascot" 
                className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 flex-shrink-0 object-contain drop-shadow-[2px_2px_0px_hsl(var(--stroke))]"
              />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-wide truncate">
                MONTHLY BUDGET
              </h1>
            </div>
          </div>
        </div>


        <WarningBanner />

        {/* Budget calculators section */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading your budget...</p>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 text-center">
            <p>{error}</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${user ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6 mt-2 md:mt-0`}>
            {/* Budget calculators - takes 2 columns on left */}
            <div className={`${user ? 'lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6' : ''} order-1`}>
              {user ? (
                <>
                  {calculators
                    .filter(calculator => visibleCalculators.has(calculator.id))
                    .map((calculator, index) => (
                    <div
                      key={calculator.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
                    >
                      <BudgetCalculator
                        id={calculator.id}
                        calculatorNumber={parseInt(calculator.id)}
                        showRemove={false}
                        onRemove={() => {}}
                        onNameChange={handleNameChange}
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
                            <p className="text-sm text-muted-foreground">Track another income source or scenario</p>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className="animate-fade-in flex items-start">
                        <PremiumLimitBanner 
                          featureName="calculators" 
                          freeLimit={1} 
                          className="min-h-[200px] flex flex-col items-center justify-center"
                          savingsAmount={totalExpenses > 100 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code }).format(Math.round(totalExpenses * (0.08 + 0.04))) : undefined}
                        />
                      </div>
                    )
                  )}
                </>
              ) : (
                <div className="animate-fade-in">
                  <BudgetCalculator
                    id="1"
                    calculatorNumber={1}
                    showRemove={false}
                    onRemove={() => {}}
                    onNameChange={handleNameChange}
                    pageType="monthly_budget"
                    onEmptyStateChange={handleCalculatorReset}
                  />
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="lg:col-span-1 space-y-4 order-2">
              {user ? (
                <>
                  {totalIncome > 0 && (
                    <div className="bg-card border-[3px] border-stroke rounded-xl p-4 shadow-cartoon">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Yearly Household Income
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-success">
                        {currency.symbol}{yearlyHouseholdIncome.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on {currency.symbol}{totalIncome.toLocaleString()}/month
                      </p>
                    </div>
                  )}
                  {!isMobile && (
                    <BudgetDonutChart
                      totalIncome={totalIncome}
                      totalExpenses={totalExpenses}
                      currency={currency}
                    />
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  {/* Fun sales pitch for guests */}
                  <div className="bg-card border-[3px] border-stroke rounded-xl p-5 shadow-cartoon">
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      Adulting is hard. Budgeting doesn't have to be. 😤
                    </h2>
                    <p className="text-sm text-muted-foreground mb-3">
                      You're already here crunching numbers — why not save your work? Sign up and unlock the full toolkit:
                    </p>
                    <ul className="space-y-2 text-sm mb-4">
                      <li className="flex items-start gap-2">
                        <span className="text-lg leading-none">🔒</span>
                        <span className="text-foreground"><strong>Your data, saved forever</strong> — no more "wait, what was my rent again?"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-lg leading-none">👯</span>
                        <span className="text-foreground"><strong>Add roommates & partners</strong> — split costs without the awkward convos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-lg leading-none">📊</span>
                        <span className="text-foreground"><strong>Charts that actually slap</strong> — see where your money goes at a glance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-lg leading-none">🤖</span>
                        <span className="text-foreground"><strong>AI money tips</strong> — like a financial advisor, but free and less judgy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-lg leading-none">🎁</span>
                        <span className="text-foreground"><strong>Gift lists, vacation planner & more</strong> — we're basically a whole adulting toolkit</span>
                      </li>
                    </ul>
                    <p className="text-xs text-muted-foreground italic">
                      No credit card needed. No spam. Just vibes and financial literacy. 🫡
                    </p>
                  </div>
                  <InlineSignUpForm />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8">
          <HomeBuyingToolkit
            monthlyIncome={totalIncome}
            monthlyExpenses={totalExpenses}
            housingExpense={totalHousingExpense}
            currencySymbol={currency.symbol}
          />
        </div>

        <div className="mt-8">
          <FeedbackForm pageSource="budget" />
        </div>

        <ToolsGrid excludeHref="/budget" />
        
        {user && <BadgeDisplay />}
        
        <FAQ faqs={budgetCalculatorFAQs} />
        
        <PageSEOContent
          title={pageSEOData.monthlyBudget.title}
          description={pageSEOData.monthlyBudget.description}
          features={pageSEOData.monthlyBudget.features}
          keywords={pageSEOData.monthlyBudget.keywords}
          premiumTitle={pageSEOData.monthlyBudget.premiumTitle}
          premiumDescription={pageSEOData.monthlyBudget.premiumDescription}
          premiumFeatures={pageSEOData.monthlyBudget.premiumFeatures}
        />
      </div>
    </div>
  );
};

export default MonthlyBudget;

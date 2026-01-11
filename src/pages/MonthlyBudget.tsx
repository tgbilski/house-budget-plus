// CHANGE: It's recommended to move the currencies array to a separate file like `src/data/currencies.ts` and import it.
// import { currencies } from '@/data/currencies';
// For this example, I will leave it here but commented out, as I cannot create a new file.

import React, { useState, useEffect } from 'react';
import { Plus, PiggyBank, Receipt, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BudgetCalculator from '@/components/BudgetCalculator';

import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/hooks/useAuth';
import { useYear } from '@/hooks/useYear';
import { useBadges } from '@/hooks/useBadges';
import { useHousehold } from '@/hooks/useHousehold';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';

import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { YearSelector } from '@/components/YearSelector';
import { budgetCalculatorFAQs } from '@/utils/faqData';
import { FAQ } from '@/components/FAQ';
import { InternalLinks } from '@/components/InternalLinks';
import { BudgetDonutChart } from '@/components/BudgetDonutChart';
import { WarningBanner } from '@/components/WarningBanner';
import { MortgagePreapprovalQuestion } from '@/components/MortgagePreapprovalQuestion';
import { ToolsGrid } from '@/components/ToolsGrid';
import { HomeBuyingToolkit } from '@/components/home-buying';
import calculatorMascot from '@/assets/calculator-mascot.png';

interface Calculator {
  id: string;
}

// const currencies = [ ... ]; // This array should be moved to a separate file.

const MonthlyBudget: React.FC = () => {
  // CHANGE: Initial state for calculators is now an empty array.
  const [calculators, setCalculators] = useState<Calculator[]>([]);
  const [budgetData, setBudgetData] = useState<Record<string, { income: number; expenses: number; housingExpense: number }>>({});
  const [calculatorNames, setCalculatorNames] = useState<Record<string, string>>({});
  
  // Track which calculators are visible (1 is always visible, 2-4 can be revealed)
  const [visibleCalculators, setVisibleCalculators] = useState<Set<string>>(new Set(['1']));

  // CHANGE: Added loading and error states for data fetching.
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currency } = useCurrency();
  const { user } = useAuth();
  const { selectedYear } = useYear();
  const { earnBadge } = useBadges();
  const { currentHousehold } = useHousehold(user?.id);
  const { subscribed } = useSubscription();

  const totalIncome = Object.values(budgetData).reduce((sum, data) => sum + (data.income || 0), 0);
  const totalExpenses = Object.values(budgetData).reduce((sum, data) => sum + (data.expenses || 0), 0);
  const totalHousingExpense = Object.values(budgetData).reduce((sum, data) => sum + (data.housingExpense || 0), 0);
  const netBalance = totalIncome - totalExpenses;
  
  console.log('MonthlyBudget - budgetData:', budgetData);
  console.log('MonthlyBudget - Total Income:', totalIncome, 'Total Expenses:', totalExpenses, 'Net Balance:', netBalance);

  // CHANGE: Implemented type-safe event listener.
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

  // CHANGE: Implemented type-safe event listener.
  useEffect(() => {
    const handleEarnBadge = (event: Event) => {
      if (event instanceof CustomEvent) {
        const { badgeType } = event.detail;
        earnBadge(badgeType);
      }
    };

    window.addEventListener('earnBadge', handleEarnBadge);
    return () => window.removeEventListener('earnBadge', handleEarnBadge);
  }, [earnBadge]);

  // CHANGE: Updated useEffect to handle both logged-in and logged-out states explicitly.
  useEffect(() => {
    // When switching years, always start with a clean slate in the UI.
    // (BudgetCalculator will re-hydrate from DB for the selected year if data exists.)
    setBudgetData({});
    setCalculatorNames({});
    setVisibleCalculators(new Set(['1']));

    if (user && currentHousehold) {
      loadCalculators();
    } else {
      // Always show 4 static calculators, but only first one visible by default
      setCalculators([{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]);
      setIsLoading(false);
    }
  }, [user, currentHousehold, selectedYear]);

  // Function to reveal the next calculator
  const revealNextCalculator = () => {
    const allIds = ['1', '2', '3', '4'];
    const nextHidden = allIds.find(id => !visibleCalculators.has(id));
    if (nextHidden) {
      setVisibleCalculators(prev => new Set([...prev, nextHidden]));
    }
  };

  // Handle reset - hide the calculator when user clicks reset
  const handleCalculatorReset = (calculatorId: string, isEmpty: boolean) => {
    // Calculator 1 always stays visible
    if (calculatorId === '1') return;
    
    if (isEmpty) {
      // Hide calculator when reset
      setVisibleCalculators(prev => {
        const next = new Set(prev);
        next.delete(calculatorId);
        return next;
      });
    }
  };

  // Get the next calculator number that can be revealed
  const getNextCalculatorNumber = () => {
    const allIds = ['1', '2', '3', '4'];
    const nextHidden = allIds.find(id => !visibleCalculators.has(id));
    return nextHidden ? parseInt(nextHidden) : null;
  };

  // CHANGE: Rewrote loadCalculators to include try/catch/finally and loading/error state management.
  const loadCalculators = async () => {
    if (!user || !currentHousehold) return;

    setIsLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('budget_data')
        .select('calculator_id')
        .eq('user_id', user.id)
        .eq('household_id', currentHousehold.id)
        .eq('year', selectedYear)
        .eq('page_type', 'monthly_budget');

      if (dbError) throw dbError;

      // Always set all 4 calculators
      setCalculators([{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]);

      if (data && data.length > 0) {
        // Show calculators that have data, plus always show calculator 1
        const uniqueCalculators = [...new Set(data.map(item => item.calculator_id))];
        const visibleSet = new Set(['1', ...uniqueCalculators]);
        setVisibleCalculators(visibleSet);
      } else {
        // Only show calculator 1 by default
        setVisibleCalculators(new Set(['1']));
      }
    } catch (err) {
      console.error("Error loading calculators:", err);
      setError("Failed to load your budget data. Please refresh the page to try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove the addCalculator function as calculators are now static

  // Remove the removeCalculator function as calculators are now static

  // Calculator names handler
  const handleNameChange = (id: string, name: string) => {
    setCalculatorNames(prev => ({ ...prev, [id]: name }));
  };

  const summaryData = [
    { title: 'Total Income', value: totalIncome, icon: PiggyBank, color: 'text-success' },
    { title: 'Total Expenses', value: totalExpenses, icon: Receipt, color: 'text-destructive' },
    { title: 'Net Balance', value: netBalance, icon: DollarSign, color: netBalance >= 0 ? 'text-primary' : 'text-destructive' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seoData.monthlyBudget.title}
        description={seoData.monthlyBudget.description}
        keywords={seoData.monthlyBudget.keywords}
        structuredData={seoData.monthlyBudget.structuredData}
        canonical={seoData.monthlyBudget.canonical}
        ogImage={seoData.monthlyBudget.ogImage}
      />
      
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-2 pb-4">
        {/* Page Header - Mascot, Title, Year Selector */}
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

        {/* Premium Promo Banner - only show for signed-in non-subscribers */}
        {user && !subscribed && (
          <div className="mb-6 p-4 rounded-xl bg-card border-[3px] border-stroke shadow-cartoon">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-foreground font-medium">
                  Want to unlock premium features?
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Get AI insights, voice tracking & more for just $4.99/month.
                </p>
              </div>
              <Link to="/settings">
                <Button className="gap-2 whitespace-nowrap">
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </div>
        )}

        <WarningBanner />

        {/* Budget calculators section with overview chart */}
        {/* CHANGE: Added conditional rendering for loading and error states */}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2 md:mt-0">
            {/* Budget calculators - takes 2 columns on left */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 order-1">
              {calculators
                .filter(calculator => visibleCalculators.has(calculator.id))
                .map((calculator, index) => (
                <div
                  key={`${selectedYear}-${calculator.id}`}
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
              
              {/* Add Calculator Button - shows when there are hidden calculators */}
              {getNextCalculatorNumber() && (
                <div className="animate-fade-in flex items-start">
                  <button
                    onClick={revealNextCalculator}
                    className="w-full max-w-md min-h-[200px] rounded-xl border-[4px] border-dashed border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-primary/50 transition-all duration-200 flex flex-col items-center justify-center gap-3 group"
                  >
                    <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Plus className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">Add Calculator {getNextCalculatorNumber()}</p>
                      <p className="text-sm text-muted-foreground">Track another income source or scenario</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Budget Overview Chart & AI Insight - takes 1 column on right */}
            <div className="lg:col-span-1 space-y-4 order-2">
              <BudgetDonutChart
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
                currency={currency}
              />
              <MortgagePreapprovalQuestion
                monthlyIncome={totalIncome}
                monthlyExpenses={totalExpenses}
                currency={currency}
              />
            </div>
          </div>
        )}

        {/* Home Buying Toolkit - Premium Feature */}
        <div className="mt-8">
          <HomeBuyingToolkit
            monthlyIncome={totalIncome}
            monthlyExpenses={totalExpenses}
            housingExpense={totalHousingExpense}
            currencySymbol={currency.symbol}
          />
        </div>

        <ToolsGrid excludeHref="/budget" />
        
        <FAQ faqs={budgetCalculatorFAQs} />
      </div>
    </div>
  );
};

export default MonthlyBudget;

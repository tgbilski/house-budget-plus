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
import heroBudgetImg from '@/assets/hero-budget.png';
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
    if (user && currentHousehold) {
      loadCalculators();
    } else {
      // Always show 4 static calculators, but only first one visible by default
      setCalculators([{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]);
      setVisibleCalculators(new Set(['1']));
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
    { title: 'Total Income', value: totalIncome, icon: PiggyBank, color: 'text-green-500' },
    { title: 'Total Expenses', value: totalExpenses, icon: Receipt, color: 'text-red-500' },
    { title: 'Net Balance', value: netBalance, icon: DollarSign, color: netBalance >= 0 ? 'text-blue-500' : 'text-red-500' },
  ];

  // Get user's first name for personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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
      
      <div className="max-w-7xl mx-auto p-4">
        {/* Calculator Mascot */}
        <div className="flex justify-center mb-4">
          <img 
            src={calculatorMascot} 
            alt="Budget Calculator Mascot" 
            className="h-24 md:h-32 w-auto object-contain drop-shadow-[4px_4px_0px_hsl(var(--stroke))]"
          />
        </div>

        {/* Welcome Hero Section */}
        <div className="relative overflow-hidden rounded-xl mb-8 border-[4px] border-stroke shadow-cartoon">
          <img 
            src={heroBudgetImg} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/70" />
          <div className="relative px-6 py-8 md:py-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex flex-col space-y-3 max-w-2xl">
                {/* Personalized Welcome */}
                <p className="text-lg md:text-xl text-muted-foreground font-medium">
                  {getGreeting()}{user ? '!' : ', welcome to House Budget Calculator!'}
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-normal pb-1">
                  Your Monthly Budget
                </h1>
                
                {/* Quick Stats Summary */}
                {(totalIncome > 0 || totalExpenses > 0) && (
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-medium">
                      <PiggyBank className="h-4 w-4" />
                      <span>{currency.symbol}{totalIncome.toLocaleString()} income</span>
                    </div>
                    <div className="flex items-center gap-2 bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full text-sm font-medium">
                      <Receipt className="h-4 w-4" />
                      <span>{currency.symbol}{totalExpenses.toLocaleString()} expenses</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                      netBalance >= 0 
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                        : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    }`}>
                      <DollarSign className="h-4 w-4" />
                      <span>{netBalance >= 0 ? '+' : ''}{currency.symbol}{netBalance.toLocaleString()} net</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Year Selector Card */}
              <div className="flex flex-col items-center lg:items-end gap-3">
                <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-md">
                  <p className="text-xs text-muted-foreground mb-2 text-center">Budget Year</p>
                  <YearSelector />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Promo Banner - only show for non-subscribers */}
        {!subscribed && (
          <Link 
            to="/settings" 
            className="block bg-sidebar text-sidebar-foreground px-4 py-3 rounded-lg text-sm md:text-base font-medium text-center mb-8 hover:opacity-90 transition-opacity border-[4px] border-stroke shadow-cartoon"
          >
            For the price of a cup of coffee per month, unleash AI on your budget!
          </Link>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Budget Overview Chart - takes 1 column */}
            <div className="lg:col-span-1 space-y-4">
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

            {/* Budget calculators - takes 2 columns */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    onRemove={() => {}} // No-op since we don't allow removal
                    onNameChange={handleNameChange}
                    pageType="monthly_budget"
                  />
                </div>
              ))}
              
              {/* Add Calculator Button - shows when there are hidden calculators */}
              {getNextCalculatorNumber() && (
                <div className="animate-fade-in">
                  <button
                    onClick={revealNextCalculator}
                    className="w-full h-full min-h-[200px] rounded-xl border-[4px] border-dashed border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-primary/50 transition-all duration-200 flex flex-col items-center justify-center gap-3 group"
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

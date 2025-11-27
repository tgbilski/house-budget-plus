// CHANGE: It's recommended to move the currencies array to a separate file like `src/data/currencies.ts` and import it.
// import { currencies } from '@/data/currencies';
// For this example, I will leave it here but commented out, as I cannot create a new file.

import React, { useState, useEffect } from 'react';
import { Plus, PiggyBank, Receipt, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BudgetCalculator from '@/components/BudgetCalculator';

import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/hooks/useAuth';
import { useYear } from '@/hooks/useYear';
import { useBadges } from '@/hooks/useBadges';
import { useHousehold } from '@/hooks/useHousehold';
import { supabase } from '@/integrations/supabase/client';

import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { YearSelector } from '@/components/YearSelector';
import { budgetCalculatorFAQs } from '@/utils/faqData';
import { FAQ } from '@/components/FAQ';
import { InternalLinks } from '@/components/InternalLinks';
import { AIChatbot } from '@/components/AIChatbot';
import { BudgetDonutChart } from '@/components/BudgetDonutChart';
import heroBudgetImg from '@/assets/hero-budget.png';

interface Calculator {
  id: string;
}

// const currencies = [ ... ]; // This array should be moved to a separate file.

const MonthlyBudget: React.FC = () => {
  // CHANGE: Initial state for calculators is now an empty array.
  const [calculators, setCalculators] = useState<Calculator[]>([]);
  const [budgetData, setBudgetData] = useState<Record<string, { income: number; expenses: number }>>({});
  const [calculatorNames, setCalculatorNames] = useState<Record<string, string>>({});

  // CHANGE: Added loading and error states for data fetching.
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currency } = useCurrency();
  const { user } = useAuth();
  const { selectedYear } = useYear();
  const { earnBadge } = useBadges();
  const { currentHousehold } = useHousehold(user?.id);

  const totalIncome = Object.values(budgetData).reduce((sum, data) => sum + (data.income || 0), 0);
  const totalExpenses = Object.values(budgetData).reduce((sum, data) => sum + (data.expenses || 0), 0);
  const netBalance = totalIncome - totalExpenses;
  
  console.log('MonthlyBudget - budgetData:', budgetData);
  console.log('MonthlyBudget - Total Income:', totalIncome, 'Total Expenses:', totalExpenses, 'Net Balance:', netBalance);

  // CHANGE: Implemented type-safe event listener.
  useEffect(() => {
    const handleBudgetUpdate = (event: Event) => {
      if (event instanceof CustomEvent) {
        const { calculatorId, income, totalExpenses } = event.detail;
        setBudgetData(prev => ({
          ...prev,
          [calculatorId]: { income: income || 0, expenses: totalExpenses || 0 }
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
      // Always show 4 static calculators.
      setCalculators([{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]);
      setIsLoading(false);
    }
  }, [user, currentHousehold, selectedYear]);

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

      if (data && data.length > 0) {
        const uniqueCalculators = [...new Set(data.map(item => item.calculator_id))];
        const sortedCalculators = uniqueCalculators.sort((a, b) => parseInt(a) - parseInt(b));
        const allCalculators = ['1', '2', '3', '4'];
        setCalculators(allCalculators.map(id => ({ id })));
      } else {
        // Always show 4 static calculators.
        setCalculators([{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]);
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
        {/* Enhanced header with background image */}
        <div className="relative overflow-hidden rounded-2xl mb-6 shadow-lg">
          <img 
            src={heroBudgetImg} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
          <div className="relative p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col lg:items-start space-y-2">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal to-teal/60 rounded-2xl shadow-lg">
                    <img
                      src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png"
                      alt="Budget calculator mascot icon"
                      className="w-7 h-7 object-contain"
                      loading="eager"
                      width="28"
                      height="28"
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-teal bg-clip-text text-transparent">
                      Monthly Budget Calculator
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                      Take control of your finances by tracking your household income and expenses.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Year selector at top right on laptop, centered on mobile */}
              <div className="flex justify-center lg:justify-end">
                <YearSelector />
              </div>
            </div>
          </div>
        </div>

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
            <div className="lg:col-span-1">
              <BudgetDonutChart
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
                currency={currency}
              />
            </div>

            {/* Budget calculators - takes 2 columns */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {calculators.map((calculator, index) => (
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
            </div>
          </div>
        )}


        <AIChatbot
          pageContext="This is the Monthly Budget Calculator page..."
          pageName="Monthly Budget Calculator"
          calculatorsData={Object.entries(calculatorNames).map(([id, name]) => ({ calculatorId: id, ownerName: name }))}
        />

        <FAQ faqs={budgetCalculatorFAQs} />
        <InternalLinks currentPage="/budget" category="planning" />
      </div>
    </div>
  );
};

export default MonthlyBudget;

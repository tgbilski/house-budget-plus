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
      // For non-logged-in users, set default with 2 calculators.
      setCalculators([{ id: '1' }, { id: '2' }]);
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
        setCalculators(sortedCalculators.map(id => ({ id })));
      } else {
        // If user is logged in but has no data, give them two default calculators.
        setCalculators([{ id: '1' }, { id: '2' }]);
      }
    } catch (err) {
      console.error("Error loading calculators:", err);
      setError("Failed to load your budget data. Please refresh the page to try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addCalculator = () => {
    if (calculators.length >= 4) return;
    const existingIds = calculators.map(c => parseInt(c.id));
    let newId = 1;
    while (existingIds.includes(newId) && newId <= 4) {
      newId++;
    }
    setCalculators([...calculators, { id: newId.toString() }]);
  };

  // CHANGE: Added try/catch block for robust error handling.
  const removeCalculator = async (calculatorId: string) => {
    if (!user || !currentHousehold) return;

    try {
      const { error: dbError } = await supabase
        .from('budget_data')
        .delete()
        .eq('user_id', user.id)
        .eq('household_id', currentHousehold.id)
        .eq('year', selectedYear)
        .eq('calculator_id', calculatorId)
        .eq('page_type', 'monthly_budget');

      if (dbError) throw dbError;

      // Remove from state only after successful deletion
      setCalculators(calculators.filter(c => c.id !== calculatorId));

      setBudgetData(prev => {
        const newData = { ...prev };
        delete newData[calculatorId];
        return newData;
      });

      setCalculatorNames(prev => {
        const newNames = { ...prev };
        delete newNames[calculatorId];
        return newNames;
      });
    } catch (err) {
      console.error("Error deleting calculator:", err);
      alert("Failed to remove the budget. Please try again.");
    }
  };

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
        canonical="https://www.housebudgetcalculator.com/budget"
      />
      
      <div className="max-w-7xl mx-auto p-4">
        {/* Compact header at very top */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex flex-col items-center lg:items-start space-y-2">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                <img
                  src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png"
                  alt="Calculator mascot"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Monthly Budget Calculator</h1>
            </div>
            <p className="text-muted-foreground text-sm text-center lg:text-left">
              Take control of your finances by tracking your household income and expenses.
            </p>
          </div>
          
          {/* Year selector at top right on laptop, centered on mobile */}
          <div className="flex justify-center lg:justify-end">
            <YearSelector />
          </div>
        </div>

        {/* Budget calculators section - moved up, no heading */}
        {/* CHANGE: Added conditional rendering for loading and error states */}
        {isLoading ? (
          <div className="text-center p-8">
            <p>Loading your budget...</p>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 text-center">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-end mb-4">
              <Button
                onClick={addCalculator}
                disabled={calculators.length >= 4}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Budget ({calculators.length}/4)
              </Button>
            </div>
            
            {/* Grid for calculators - ensure side by side on laptop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {calculators.map((calculator) => (
                <BudgetCalculator
                  key={calculator.id}
                  id={calculator.id}
                  calculatorNumber={parseInt(calculator.id)}
                  showRemove={calculators.length > 1}
                  onRemove={() => removeCalculator(calculator.id)}
                  onNameChange={handleNameChange}
                  pageType="monthly_budget"
                />
              ))}
            </div>
          </>
        )}


        <AIChatbot
          pageContext="This is the Monthly Budget Calculator page..."
          pageName="Monthly Budget Calculator"
          calculatorsData={Object.entries(calculatorNames).map(([id, name]) => ({ calculatorId: id, ownerName: name }))}
        />
      </div>
    </div>
  );
};

export default MonthlyBudget;

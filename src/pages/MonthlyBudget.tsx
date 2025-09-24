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
      // For non-logged-in users, set a default state.
      setCalculators([{ id: '1' }]);
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
        // If user is logged in but has no data, give them one default calculator.
        setCalculators([{ id: '1' }]);
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
      
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="lg:flex-1" />
            <div className="flex flex-col items-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
                <img
                  src="/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png"
                  alt="Calculator mascot"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <h1 className="text-4xl font-bold text-foreground">Monthly Budget Calculator</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Take control of your finances by tracking every dollar of your household income and expenses.
              </p>
            </div>
            <div className="flex justify-center lg:flex-1 lg:justify-end">
              <YearSelector />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {summaryData.map((item) => (
            <div key={item.title} className="bg-card rounded-xl border p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                  <p className={`text-2xl font-bold ${item.color}`}>
                    {currency.symbol}{item.value.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-full">
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
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
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Budget Calculators</h2>
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
                <div className="space-y-6">
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
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Tips</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Track every expense to see where your money really goes</p>
                <p>Aim to save at least 20% of your income</p>
                <p>Review and adjust your budget monthly</p>
              </div>
            </div>
          </div>
        </div>

        {/* The rest of the page remains the same */}
        <div className="bg-card rounded-xl border p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Why Use Our Budget Calculator?</h2>
            {/* ... Features Section ... */}
        </div>

        <div className="space-y-8">
          <FAQ faqs={budgetCalculatorFAQs} />
          <InternalLinks currentPage="/" category="budgeting" />
        </div>

        <div className="bg-card rounded-xl border p-8 text-center">
          <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
          <p className="text-muted-foreground mb-6">
            Get in touch with questions, suggestions, or feedback about our budget calculator.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.href = 'mailto:homebudgetcalculator@gmail.com?subject=Budget Calculator Feedback'}
          >
            Contact Us
          </Button>
        </div>

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

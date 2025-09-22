import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useYear } from '@/hooks/useYear';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { supabase } from '@/integrations/supabase/client';
import BudgetCalculator from '@/components/BudgetCalculator';
import { SEO } from '@/components/SEO';

const MonthlyBudget = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { selectedYear } = useYear();

  const [calculators, setCalculators] = useState<{ id: string }[]>([]);
  const [budgetData, setBudgetData] = useState<Record<string, any>>({});
  const [calculatorNames, setCalculatorNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && currentHousehold) {
      loadCalculators();
    }
  }, [user, currentHousehold, selectedYear]);

  const loadCalculators = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('budget_data')
      .select('calculator_id')
      .eq('user_id', user.id)
      .eq('household_id', currentHousehold.id)
      .eq('page_type', 'monthly_budget')
      .eq('year', selectedYear);

    if (data && data.length > 0) {
      const uniqueCalculators = [...new Set(data.map(item => item.calculator_id))];
      const sortedCalculators = uniqueCalculators.sort((a, b) => parseInt(a) - parseInt(b));
      setCalculators(sortedCalculators.map(id => ({ id })));
    }
  };

  const addCalculator = () => {
    if (calculators.length >= 4) return;
    const existingIds = calculators.map(c => parseInt(c.id));
    let newId = 1;
    while (existingIds.includes(newId) && newId <= 4) newId++;
    setCalculators([...calculators, { id: newId.toString() }]);
  };

  const removeCalculator = async (calculatorId: string) => {
    if (!user || !currentHousehold) return;

    await supabase
      .from('budget_data')
      .delete()
      .eq('user_id', user.id)
      .eq('household_id', currentHousehold.id)
      .eq('year', selectedYear)
      .eq('calculator_id', calculatorId)
      .eq('page_type', 'monthly_budget');

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
  };

  const handleNameChange = (id: string, name: string) => {
    setCalculatorNames(prev => ({
      ...prev,
      [id]: name
    }));
  };

  // ...rest of the component, including rendering and SEO, stays the same.
  // Just ensure any child components (like BudgetCalculator) also use selectedYear in their database operations.

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Monthly Budget"
        description="Manage your monthly budget"
        keywords="budget, monthly, household"
        canonical="https://www.housebudgetcalculator.com/budget"
      />
      {/* Render calculators and UI */}
    </div>
  );
};

export default MonthlyBudget;

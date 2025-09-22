import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useYear } from '@/hooks/useYear';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import BudgetCalculator from '@/components/BudgetCalculator';

const MonthlyBudget: React.FC = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { selectedYear } = useYear();

  const [calculators, setCalculators] = useState<{ id: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load calculators from DB
  useEffect(() => {
    const loadCalculators = async () => {
      setLoading(true);
      setError(null);
      if (!user || !currentHousehold) {
        setError("User or household not loaded.");
        setCalculators([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('budget_data')
        .select('calculator_id')
        .eq('user_id', user.id)
        .eq('household_id', currentHousehold.id)
        .eq('page_type', 'monthly_budget')
        .eq('year', selectedYear);

      if (error) {
        setError(error.message);
        setCalculators([]);
      } else if (data && data.length > 0) {
        const uniqueCalculators = [...new Set(data.map(item => item.calculator_id))];
        setCalculators(uniqueCalculators.map(id => ({ id })));
      } else {
        setCalculators([]);
      }
      setLoading(false);
    };

    loadCalculators();
  }, [user, currentHousehold, selectedYear]);

  // Add a new calculator
  const addCalculator = async () => {
    setError(null);
    if (!user || !currentHousehold) {
      setError("User or household not loaded.");
      return;
    }
    // Generate a new calculator id (1-4, or next available)
    const existingIds = calculators.map(c => parseInt(c.id)).filter(n => !isNaN(n));
    let newId = 1;
    while (existingIds.includes(newId) && newId <= 4) newId++;
    if (newId > 4) {
      setError("Maximum of 4 calculators allowed.");
      return;
    }
    const calculatorId = newId.toString();
    const { error } = await supabase
      .from('budget_data')
      .insert({
        user_id: user.id,
        household_id: currentHousehold.id,
        calculator_id: calculatorId,
        page_type: 'monthly_budget',
        year: selectedYear,
        income: 0,
        expenses: {},
      });

    if (error) {
      setError(error.message);
    } else {
      setCalculators(prev => [...prev, { id: calculatorId }]);
    }
  };

  // Remove a calculator
  const removeCalculator = async (calculatorId: string) => {
    setError(null);
    if (!user || !currentHousehold) {
      setError("User or household not loaded.");
      return;
    }
    const { error } = await supabase
      .from('budget_data')
      .delete()
      .eq('user_id', user.id)
      .eq('household_id', currentHousehold.id)
      .eq('calculator_id', calculatorId)
      .eq('page_type', 'monthly_budget')
      .eq('year', selectedYear);

    if (error) {
      setError(error.message);
    } else {
      setCalculators(prev => prev.filter(c => c.id !== calculatorId));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Monthly Budget" description="Manage your monthly budget" keywords="budget, monthly, household" />
      <h1 className="text-2xl font-bold mb-4">Monthly Budget</h1>
      {error && <div className="text-red-600 mb-2">Error: {error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : calculators.length === 0 ? (
        <div className="space-y-4">
          <div>No budget calculators found for this year.</div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={addCalculator}
          >
            Add Calculator
          </button>
        </div>
      ) : (
        <>
          <div className="flex mb-4 gap-2">
            {calculators.length < 4 && (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={addCalculator}
              >
                Add Calculator
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {calculators.map((c, idx) => (
              <BudgetCalculator
                key={c.id}
                id={c.id}
                calculatorNumber={idx + 1}
                onRemove={() => removeCalculator(c.id)}
                showRemove={calculators.length > 1}
                pageType="monthly_budget"
                onNameChange={() => {}}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyBudget;

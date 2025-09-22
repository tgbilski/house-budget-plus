import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useYear } from '@/hooks/useYear';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';

const MonthlyBudget: React.FC = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { selectedYear } = useYear();

  const [calculators, setCalculators] = useState<{ id: string }[]>([]);

  useEffect(() => {
    if (user && currentHousehold) {
      loadCalculators();
    }
    // eslint-disable-next-line
  }, [user, currentHousehold, selectedYear]);

  const loadCalculators = async () => {
    const { data } = await supabase
      .from('budget_data')
      .select('calculator_id')
      .eq('user_id', user.id)
      .eq('household_id', currentHousehold.id)
      .eq('page_type', 'monthly_budget')
      .eq('year', selectedYear);

    if (data && data.length > 0) {
      const uniqueCalculators = [...new Set(data.map(item => item.calculator_id))];
      setCalculators(uniqueCalculators.map(id => ({ id })));
    }
  };

  return (
    <div>
      <SEO title="Monthly Budget" description="Manage your monthly budget" keywords="budget, monthly, household" />
      {/* ...your monthly budget UI here... */}
    </div>
  );
};

export default MonthlyBudget;

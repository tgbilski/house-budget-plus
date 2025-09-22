import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useYear } from '@/hooks/useYear';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { supabase } from '@/integrations/supabase/client';

const SavingsGoals: React.FC = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { selectedYear } = useYear();

  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);
  const [currentGoalId, setCurrentGoalId] = useState<string | null>(null);

  useEffect(() => {
    if (user && currentHousehold) {
      loadSavingsGoals();
    }
    // eslint-disable-next-line
  }, [user, currentHousehold, selectedYear]);

  const loadSavingsGoals = async () => {
    const { data } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('household_id', currentHousehold.id)
      .eq('year', selectedYear);

    if (data && data.length > 0) {
      setSavingsGoals(data);
      setCurrentGoalId(data[0].id);
    }
  };

  return (
    <div>
      {/* ...your savings goals UI here... */}
    </div>
  );
};

export default SavingsGoals;

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useYear } from '@/hooks/useYear';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { supabase } from '@/integrations/supabase/client';

const Vacation: React.FC = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { selectedYear } = useYear();
  const [vacationOptions, setVacationOptions] = useState<any[]>([]);

  useEffect(() => {
    if (user && currentHousehold) {
      loadVacationOptions();
    }
    // eslint-disable-next-line
  }, [user, currentHousehold, selectedYear]);

  const loadVacationOptions = async () => {
    const { data } = await supabase
      .from('vacation_options')
      .select('*')
      .eq('user_id', user.id)
      .eq('household_id', currentHousehold.id)
      .eq('year', selectedYear);
    if (data && data.length > 0) setVacationOptions(data);
  };

  return (
    <div>
      {/* ...your vacation options UI here... */}
    </div>
  );
};

export default Vacation;

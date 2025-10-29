import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Adjust these types to match your table columns
type Household = {
  id: string;
  name: string;
  originator_id: string;
};

export function useHousehold(userId?: string) {
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [userHouseholds, setUserHouseholds] = useState<Household[]>([]);
  const [isOriginator, setIsOriginator] = useState(false);
  const [loading, setLoading] = useState(true);

  // Creates a household for a brand new user. No changes needed here.
  const createAndSetDefaultHousehold = useCallback(async () => {
    if (!userId) return null;
    try {
      const { data: household, error: householdError } = await supabase
        .from("households")
        .insert([{ name: "My Household", originator_id: userId }])
        .select()
        .single();
      if (householdError) throw householdError;

      const { error: memberError } = await supabase
        .from("household_members")
        .insert([{ user_id: userId, household_id: household.id, role: 'originator' }]);
      if (memberError) throw memberError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ current_household_id: household.id })
        .eq("user_id", userId);
      if (profileError) throw profileError;

      return household;
    } catch (error) {
      console.error("Error creating and setting default household:", error);
      return null;
    }
  }, [userId]);

  // Fetches all households where the user is a member. No changes needed here.
  const fetchUserHouseholds = useCallback(async () => {
    if (!userId) return [];
    const { data: memberships, error } = await supabase
      .from("household_members")
      .select("household:households(*)")
      .eq("user_id", userId);

    if (error || !memberships) {
      console.error("Error fetching user households:", error);
      return [];
    }
    return memberships.map((m: any) => m.household).filter(Boolean);
  }, [userId]);

  // **REFACTORED**: Determines the current household from a PRE-FETCHED list.
  const determineCurrentHousehold = useCallback(async (households: Household[]) => {
    if (!userId) return null;

    if (households.length === 0) {
      return await createAndSetDefaultHousehold();
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("current_household_id")
      .eq("user_id", userId)
      .single();

    if (profile?.current_household_id) {
      const preferredHousehold = households.find(h => h.id === profile.current_household_id);
      if (preferredHousehold) {
        return preferredHousehold;
      }
    }

    // If no preferred household is set or found, default to the last one.
    const defaultHousehold = households[households.length - 1];
    
    // Asynchronously update the profile in the background to persist this choice.
    await supabase
      .from("profiles")
      .update({ current_household_id: defaultHousehold.id })
      .eq("user_id", userId);
      
    return defaultHousehold;
  }, [userId, createAndSetDefaultHousehold]);


  // **REFACTORED**: Main refresh function with a single source of truth.
  const refresh = useCallback(async () => {
    setLoading(true);

    // 1. Fetch the list of households ONCE.
    const households = await fetchUserHouseholds();

    // 2. Pass that single list to determine the current one.
    const currentHh = await determineCurrentHousehold(households);
    
    // 3. Set all state from this single, consistent source.
    setUserHouseholds(households);
    setCurrentHousehold(currentHh);
    setIsOriginator(currentHh?.originator_id === userId);

    setLoading(false);
  }, [userId, fetchUserHouseholds, determineCurrentHousehold]);

  useEffect(() => {
    if (userId) {
      refresh();
    } else {
      // Clear state if user logs out
      setLoading(false);
      setCurrentHousehold(null);
      setUserHouseholds([]);
      setIsOriginator(false);
    }
  }, [userId]); // Only depend on userId to prevent infinite loops
  
  // No changes needed for the functions below, as they correctly call `refresh`.
  
  const switchHousehold = async (householdId: string) => {
    if (!userId) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ current_household_id: householdId })
        .eq("user_id", userId);
      if (error) throw error;
      await refresh(); // Refresh state after switching
    } catch (error) {
      console.error("Error switching household:", error);
    } finally {
      setLoading(false);
    }
  };

  const createHousehold = async (name: string) => {
    if (!userId) return false;
    setLoading(true);
    try {
      const { data: newHousehold, error: createError } = await supabase
        .from("households")
        .insert([{ name, originator_id: userId }])
        .select()
        .single();
      if (createError || !newHousehold) throw createError;

      const { error: memberError } = await supabase
        .from("household_members")
        .insert([{ user_id: userId, household_id: newHousehold.id, role: 'originator' }]);
      if (memberError) throw memberError;
      
      // After creating, switch to it and refresh
      await switchHousehold(newHousehold.id); 
      return true;
    } catch (error) {
      console.error("Error in createHousehold:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const renameHousehold = async (newName: string) => {
    if (!currentHousehold || !isOriginator) return false;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("households")
        .update({ name: newName })
        .eq("id", currentHousehold.id);
      if (error) throw error;
      await refresh();
      return true;
    } catch (error) {
      console.error("Error renaming household:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentHousehold,
    userHouseholds,
    isOriginator,
    loading,
    switchHousehold,
    createHousehold,
    renameHousehold,
  };
}

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

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

  // Fetch all households where the user is a member
  const fetchUserHouseholds = async () => {
    if (!userId) return [];
    // Find all households the user belongs to
    const { data: memberships, error: membershipsError } = await supabase
      .from("household_members")
      .select("household_id, household:households(*)")
      .eq("user_id", userId);

    if (membershipsError || !memberships) return [];

    // Extract households
    return memberships.map((m: any) => m.household);
  };

  // Fetch the household marked as "current" for this user (if you have such logic)
  // Otherwise, just pick the first one
  const fetchCurrentHousehold = async () => {
    const households = await fetchUserHouseholds();
    return households[0] || null;
  };

  // Switch the current household (this is app-specific logic; you may need to persist this in user profile, etc.)
  const switchHousehold = async (householdId: string) => {
    // Example: update a "current_household_id" column in the user's profile
    if (!userId) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ current_household_id: householdId })
      .eq("id", userId);
    setLoading(false);
    await refresh();
    if (error) throw error;
  };

  // Create a new household (originator is the current user)
  const createHousehold = async (name: string) => {
    if (!userId) return false;
    setLoading(true);
    // Insert household and membership
    const { data, error } = await supabase
      .from("households")
      .insert([{ name, originator_id: userId }])
      .select()
      .single();
    if (error || !data) {
      setLoading(false);
      return false;
    }
    // Add user as member
    await supabase
      .from("household_members")
      .insert([{ user_id: userId, household_id: data.id }]);
    await refresh();
    return true;
  };

  // Rename the current household
  const renameHousehold = async (newName: string) => {
    if (!currentHousehold) return false;
    setLoading(true);
    const { error } = await supabase
      .from("households")
      .update({ name: newName })
      .eq("id", currentHousehold.id);
    setLoading(false);
    await refresh();
    return !error;
  };

  // Refresh Households
  const refresh = useCallback(async () => {
    setLoading(true);
    const households = await fetchUserHouseholds();
    setUserHouseholds(households);
    setCurrentHousehold(households[0] || null);
    setIsOriginator((households[0]?.originator_id ?? "") === userId);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient"; // adjust this path if needed

type Household = {
  id: string;
  name: string;
  role: "originator" | "member";
  originator_id: string;
  // ...add any other relevant fields!
};

export function useHousehold() {
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);
  const [userHouseholds, setUserHouseholds] = useState<Household[]>([]);
  const [isOriginator, setIsOriginator] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch the currently-selected household for this user
  const fetchCurrentHousehold = async (): Promise<Household | null> => {
    // Replace with your logic to get the current household, e.g. from user profile or a "selected" flag
    const { data, error } = await supabase
      .from("households")
      .select("*")
      .eq("is_current", true)
      .single();
    if (error) return null;
    return data as Household;
  };

  // Fetch all households this user is a member of
  const fetchUserHouseholds = async (): Promise<Household[]> => {
    // Replace with your actual user ID logic
    const { data, error } = await supabase
      .from("households")
      .select("*");
    if (error) return [];
    return data as Household[];
  };

  // Switch the active household for this user
  const switchHousehold = async (householdId: string) => {
    setLoading(true);
    // Update the current household for this user (customize as needed)
    // Example: set is_current=false for all, is_current=true for selected
    const { error: clearError } = await supabase
      .from("households")
      .update({ is_current: false })
      .eq("is_current", true);
    const { error: setError } = await supabase
      .from("households")
      .update({ is_current: true })
      .eq("id", householdId);
    if (clearError || setError) {
      setLoading(false);
      throw new Error("Failed to switch household");
    }
    await refresh();
  };

  // Create a new household for this user
  const createHousehold = async (name: string) => {
    setLoading(true);
    // You may want to set originator_id from the authenticated user
    const { data, error } = await supabase
      .from("households")
      .insert([{ name }]);
    if (error) {
      setLoading(false);
      return false;
    }
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
    if (error) {
      setLoading(false);
      return false;
    }
    await refresh();
    return true;
  };

  // --- Data Fetch & State ---

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [current, households] = await Promise.all([
        fetchCurrentHousehold(),
        fetchUserHouseholds(),
      ]);
      setCurrentHousehold(current);
      setUserHouseholds(households);
      setIsOriginator(current?.role === "originator");
    } catch (err) {
      setCurrentHousehold(null);
      setUserHouseholds([]);
      setIsOriginator(false);
    }
    setLoading(false);
  }, []);

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

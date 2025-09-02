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

  // Fetch the household marked as "current" for this user
  const fetchCurrentHousehold = async () => {
    if (!userId) return null;
    
    // Get user's current household preference
    const { data: profile } = await supabase
      .from("profiles")
      .select("current_household_id")
      .eq("user_id", userId)
      .single();
    
    const households = await fetchUserHouseholds();
    
    // If user has a preferred household and it exists in their memberships, use it
    if (profile?.current_household_id) {
      const preferredHousehold = households.find(h => h.id === profile.current_household_id);
      if (preferredHousehold) {
        return preferredHousehold;
      }
    }
    
    // Otherwise, return the first household
    return households[0] || null;
  };

  // Switch the current household
  const switchHousehold = async (householdId: string) => {
    if (!userId) return;
    setLoading(true);
    
    try {
      // Update user's current household preference
      const { error } = await supabase
        .from("profiles")
        .update({ current_household_id: householdId })
        .eq("user_id", userId);
      
      if (error) throw error;
      
      // Refresh to get the new current household
      await refresh();
    } catch (error) {
      console.error("Error switching household:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new household (originator is the current user)
  const createHousehold = async (name: string) => {
    console.log("Creating household with name:", name, "userId:", userId);
    if (!userId) {
      console.log("No userId found, returning false");
      return false;
    }
    setLoading(true);
    
    try {
      console.log("Step 1: Creating household...");
      // Insert household and membership
      const { data, error } = await supabase
        .from("households")
        .insert([{ name, originator_id: userId }])
        .select()
        .single();
        
      if (error || !data) {
        console.error("Error creating household:", error);
        return false;
      }
      
      console.log("Step 2: Household created successfully:", data);
      
      // Add user as member with originator role
      console.log("Step 3: Adding user as member...");
      const { error: memberError } = await supabase
        .from("household_members")
        .insert([{ user_id: userId, household_id: data.id, role: 'originator' }]);
      
      if (memberError) {
        console.error("Error adding user as member:", memberError);
        return false;
      }
      
      console.log("Step 4: User added as member successfully");
      
      // Set as current household
      console.log("Step 5: Setting as current household...");
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ current_household_id: data.id })
        .eq("user_id", userId);
      
      if (profileError) {
        console.error("Error updating current household:", profileError);
      }
      
      console.log("Step 6: Current household set, refreshing...");
      await refresh();
      console.log("Step 7: Household creation completed successfully");
      return true;
    } catch (error) {
      console.error("Error in createHousehold:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Rename the current household
  const renameHousehold = async (newName: string) => {
    if (!currentHousehold || !userId) return false;
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("households")
        .update({ name: newName })
        .eq("id", currentHousehold.id)
        .eq("originator_id", userId); // Only allow originator to rename
      
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

  // Refresh Households
  const refresh = useCallback(async () => {
    setLoading(true);
    const households = await fetchUserHouseholds();
    const currentHh = await fetchCurrentHousehold();
    
    setUserHouseholds(households);
    setCurrentHousehold(currentHh);
    setIsOriginator((currentHh?.originator_id ?? "") === userId);
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

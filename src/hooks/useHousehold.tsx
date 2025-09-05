import { useState, useEffect } from "react";
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

  const fetchUserHouseholds = async () => {
    if (!userId) return [];
    const { data: memberships, error: membershipsError } = await supabase
      .from("household_members")
      .select("household_id, household:households(*)")
      .eq("user_id", userId);

    if (membershipsError || !memberships) return [];
    return memberships.map((m: any) => m.household);
  };

  const fetchCurrentHousehold = async () => {
    if (!userId) return null;
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("current_household_id")
      .eq("user_id", userId)
      .single();
    
    const households = await fetchUserHouseholds();
    
    if (profile?.current_household_id) {
      const preferredHousehold = households.find(h => h.id === profile.current_household_id);
      if (preferredHousehold) {
        return preferredHousehold;
      }
    }
    
    return households[0] || null;
  };

  // Switch the current household
  const switchHousehold = async (householdId: string) => {
    if (!userId) return;
    setLoading(true);
    
    try {
      // Find the new household in the existing list to update the UI instantly
      const newHousehold = userHouseholds.find(h => h.id === householdId);
      if (newHousehold) {
          setCurrentHousehold(newHousehold);
      }

      // Then, update the backend
      const { error } = await supabase
        .from("profiles")
        .update({ current_household_id: householdId })
        .eq("user_id", userId);
      
      if (error) throw error;
      
      // Finally, trigger a full refresh in the background to ensure all state is consistent
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
      
      console.log("Step 3: Adding user as member...");
      const { error: memberError } = await supabase
        .from("household_members")
        .insert([{ user_id: userId, household_id: data.id, role: 'originator' }]);
      
      if (memberError) {
        console.error("Error adding user as member:", memberError);
        return false;
      }
      
      console.log("Step 4: User added as member successfully");
      
      console.log("Step 5: Setting as current household...");
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ current_household_id: data.id })
        .eq("user_id", userId);
      
      if (profileError) {
        console.error("Error updating current household:", profileError);
      }
      
      setIsOriginator(true);
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
        .eq("originator_id", userId);
      
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
  const refresh = async () => {
    setLoading(true);
    const households = await fetchUserHouseholds();
    const currentHh = await fetchCurrentHousehold();
    
    setUserHouseholds(households);
    setCurrentHousehold(currentHh);
    setIsOriginator((currentHh?.originator_id ?? "") === userId);
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      refresh();
    }
  }, [userId]);

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

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

  // Helper function to fetch all households a user belongs to
  const fetchUserHouseholds = async () => {
    if (!userId) {
      console.log("fetchUserHouseholds - no userId provided");
      return [];
    }
    
    console.log("fetchUserHouseholds - fetching for userId:", userId);
    
    const { data: memberships, error: membershipsError } = await supabase
      .from("household_members")
      .select("household_id, household:households(*)")
      .eq("user_id", userId);

    console.log("fetchUserHouseholds - result:", { memberships, membershipsError });

    if (membershipsError || !memberships) {
      console.log("fetchUserHouseholds - error or no data:", membershipsError);
      return [];
    }
    const households = memberships.map((m: any) => m.household);
    console.log("fetchUserHouseholds - mapped households:", households);
    return households;
  };

  // Main function to fetch the user's current household and handle the default case
  const fetchCurrentHousehold = async () => {
    if (!userId) {
      console.log("fetchCurrentHousehold - no userId provided");
      return null;
    }
    
    console.log("fetchCurrentHousehold - fetching for userId:", userId);
    
    // 1. Fetch the user's profile to get their preferred household ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("current_household_id")
      .eq("user_id", userId)
      .single();
    
    console.log("fetchCurrentHousehold - profile:", { profile, profileError });
    
    // 2. Fetch all households the user is a member of
    const households = await fetchUserHouseholds();
    console.log("fetchCurrentHousehold - households:", households);
    
    // 3. Check if the user's profile has a current household ID set
    if (profile?.current_household_id) {
      const preferredHousehold = households.find(h => h.id === profile.current_household_id);
      if (preferredHousehold) {
        console.log("fetchCurrentHousehold - found preferred household:", preferredHousehold);
        return preferredHousehold;
      }
    }
    
    // 4. If no preferred household is set, and the user has at least one household,
    //    automatically set the first one as their current household.
    if (households.length > 0 && !profile?.current_household_id) {
        const firstHousehold = households[0];
        if (firstHousehold) {
            console.log("No current household set. Defaulting to the first one:", firstHousehold);
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ current_household_id: firstHousehold.id })
                .eq("user_id", userId);
            
            console.log("fetchCurrentHousehold - update profile result:", updateError);
            
            // Return the first household, which will now be the new current household
            return firstHousehold;
        }
    }

    // 5. If there are no households or a current household is already set, return the first one or null
    const result = households[0] || null;
    console.log("fetchCurrentHousehold - final result:", result);
    return result;
  };

  // Switch the current household
  const switchHousehold = async (householdId: string) => {
    if (!userId) return;
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ current_household_id: householdId })
        .eq("user_id", userId);
      
      if (error) throw error;
      
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
    console.log("useHousehold - userId changed:", userId);
    if (userId) {
      console.log("useHousehold - calling refresh for userId:", userId);
      refresh();
    } else {
      console.log("useHousehold - no userId, skipping refresh");
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

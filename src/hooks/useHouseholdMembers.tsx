import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Member = {
  id: string;
  user_id: string;
  household_id: string;
  // ...add additional fields as needed
};

export function useHouseholdMembers(householdId?: string) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!householdId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("household_members")
      .select("*")
      .eq("household_id", householdId);
    setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [householdId]);

  return {
    members,
    loading,
    refresh,
  };
}

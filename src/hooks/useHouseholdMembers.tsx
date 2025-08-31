import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Member = {
  id: string;
  user_id: string;
  household_id: string;
  role: string;
  can_edit: boolean;
  can_view: boolean;
  joined_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
};

export function useHouseholdMembers(householdId?: string) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!householdId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("household_members")
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          email
        )
      `)
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

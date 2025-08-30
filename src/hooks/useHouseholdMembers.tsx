import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // adjust this path if needed

type Member = {
  id: string;
  name: string;
  email: string;
  // ...other fields
};

export function useHouseholdMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    // Replace with your logic to fetch household members for the current household
    const { data, error } = await supabase
      .from("household_members")
      .select("*");
    setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    members,
    loading,
    refresh,
  };
}

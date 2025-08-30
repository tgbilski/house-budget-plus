import { useState, useEffect } from "react";

// Replace with your actual API functions
import { fetchHouseholdMembers } from "@/lib/api/householdMembers";

export function useHouseholdMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setMembers(await fetchHouseholdMembers());
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

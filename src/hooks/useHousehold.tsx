import { useState, useEffect, useCallback } from "react";

// Adjust types to fit your backend response shape
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

  // --- API Calls ---

  // Fetch the currently-selected household for this user
  const fetchCurrentHousehold = async (): Promise<Household> => {
    const res = await fetch("/api/household/current");
    if (!res.ok) throw new Error("Failed to fetch current household");
    return res.json();
  };

  // Fetch all households this user is a member of
  const fetchUserHouseholds = async (): Promise<Household[]> => {
    const res = await fetch("/api/household");
    if (!res.ok) throw new Error("Failed to fetch households");
    return res.json();
  };

  // Switch the active household for this user
  const switchHousehold = async (householdId: string) => {
    setLoading(true);
    const res = await fetch(`/api/household/switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ householdId }),
    });
    if (!res.ok) throw new Error("Failed to switch household");
    await refresh();
  };

  // Create a new household for this user
  const createHousehold = async (name: string) => {
    setLoading(true);
    const res = await fetch(`/api/household`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
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
    const res = await fetch(`/api/household/${currentHousehold.id}/rename`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (!res.ok) {
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

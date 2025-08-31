import React, { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHousehold } from "@/hooks/useHousehold";

const HouseholdContext = createContext<ReturnType<typeof useHousehold> | null>(null);

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const householdData = useHousehold(user?.id);

  return (
    <HouseholdContext.Provider value={householdData}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHouseholdContext() {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error("useHouseholdContext must be used within HouseholdProvider");
  }
  return context;
}
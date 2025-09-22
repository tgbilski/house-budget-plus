import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface YearContextType {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  availableYears: number[];
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export const YearProvider = ({ children }: { children: ReactNode }) => {
  const currentYear = new Date().getUTCFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  
  // Generate available years (current year and next 3 years)
  const availableYears = Array.from(
    { length: 4 }, 
    (_, i) => currentYear + i
  ).sort((a, b) => a - b); // Sort in ascending order

  useEffect(() => {
    // Store selected year in sessionStorage for current session persistence
    sessionStorage.setItem('selectedYear', selectedYear.toString());
  }, [selectedYear]);

  useEffect(() => {
    // Restore selected year from sessionStorage on load (session persistence)
    const stored = sessionStorage.getItem('selectedYear');
    if (stored) {
      const year = parseInt(stored);
      if (availableYears.includes(year)) {
        setSelectedYear(year);
      }
    }
  }, [availableYears]);

  // Reset to current year when component unmounts (on logout/session end)
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('selectedYear');
    };
  }, []);

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear, availableYears }}>
      {children}
    </YearContext.Provider>
  );
};

export const useYear = () => {
  const context = useContext(YearContext);
  if (!context) {
    throw new Error('useYear must be used within a YearProvider');
  }
  return context;
};
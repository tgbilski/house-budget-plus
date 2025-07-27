import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "@/components/Header";
import MonthlyBudget from "@/pages/MonthlyBudget";
import ComparePrices from "@/pages/ComparePrices";
import Takeout from "@/pages/Takeout";
import Vacation from "@/pages/Vacation";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import { useState, createContext } from "react";

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const queryClient = new QueryClient();

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

const App = () => {
  const [currency, setCurrency] = useState(currencies[0]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <CurrencyContext.Provider value={{ currency, setCurrency }}>
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <Header />
                <Routes>
                  <Route path="/" element={<MonthlyBudget />} />
                  <Route path="/compare-prices" element={<ComparePrices />} />
                  <Route path="/takeout" element={<Takeout />} />
                  <Route path="/vacation" element={<Vacation />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </CurrencyContext.Provider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

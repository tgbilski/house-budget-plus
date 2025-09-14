import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { HouseholdProvider, useHouseholdContext } from "@/providers/HouseholdProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import ScrollToTop from "@/components/ScrollToTop";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import Home from "@/pages/Home";
import MonthlyBudget from "@/pages/MonthlyBudget";
import CompareVendors from "@/pages/CompareVendors";
import SavingsGoals from "@/pages/SavingsGoals";
import Vacation from "@/pages/Vacation";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import UserSettings from "@/pages/UserSettings";
import Engagement from "@/pages/Engagement";
import AIInsights from "@/pages/AIInsights";
import { Gifts } from "@/pages/Gifts";
import AboutUs from "@/pages/AboutUs";
import ContactUs from "@/pages/ContactUs";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import Disclaimer from "@/pages/Disclaimer";
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

const defaultCurrency = { code: 'USD', symbol: '$', name: 'US Dollar' };

export const CurrencyContext = createContext<CurrencyContextType>({
  currency: defaultCurrency,
  setCurrency: () => {}
});

const queryClient = new QueryClient();

// Main App Routes Component (needs to be inside HouseholdProvider)
const AppRoutes = () => {
  const { currentHousehold } = useHouseholdContext();
  
  return (
    <Routes key={currentHousehold?.id || 'no-household'}>
      <Route path="/" element={<Home />} />
      <Route path="/budget" element={<MonthlyBudget />} />
      <Route path="/savings" element={<SavingsGoals />} />
      <Route path="/home" element={<Home />} />
      <Route path="/compare-prices" element={<CompareVendors />} />
      <Route path="/vacation" element={<Vacation />} />
      <Route path="/engagement" element={<Engagement />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/settings" element={<UserSettings />} />
      <Route path="/gifts" element={<Gifts />} />
      <Route path="/ai-insights" element={<AIInsights />} />
      <Route path="/subscription-success" element={<SubscriptionSuccess />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/disclaimer" element={<Disclaimer />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const [currency, setCurrency] = useState(defaultCurrency);
  const isMobile = useIsMobile();

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <SubscriptionProvider>
              <HouseholdProvider>
                <CurrencyContext.Provider value={{ currency, setCurrency }}>
                  <BrowserRouter>
                    <ScrollToTop />
                    <SidebarProvider defaultOpen={isMobile ? false : false}>
                      <div 
                        className="min-h-screen w-full flex flex-col relative"
                        style={{ 
                          backgroundColor: 'hsl(213, 50%, 22%)',
                          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.04) 40px, rgba(255,255,255,0.04) 42px)'
                        }}
                      >
                        <Header />
                         <div className="flex flex-1">
                           {!isMobile && <AppSidebar />}
                           <div className="flex-1 flex flex-col min-w-0">
                             {isMobile && <AppSidebar />}
                             <main className="flex-1 p-2 sm:p-4 md:p-6">
                               <AppRoutes />
                             </main>
                             <Footer />
                           </div>
                         </div>
                       </div>
                    </SidebarProvider>
                  </BrowserRouter>
                </CurrencyContext.Provider>
              </HouseholdProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
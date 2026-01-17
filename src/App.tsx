import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SkipToMain } from "@/components/SkipToMain";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobileAppHeader } from "@/components/MobileAppHeader";
import { SubscriptionGuard } from "@/components/SubscriptionGuard";
import { SplashScreen } from "@/components/SplashScreen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { trackPageView } from "@/utils/analytics";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { YearProvider } from "@/hooks/useYear";
import { HouseholdProvider } from "@/providers/HouseholdProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import ScrollToTop from "@/components/ScrollToTop";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
// Features page consolidated into MonthlyBudget
import MobileLanding from "@/pages/MobileLanding";
import Expenses from "@/pages/Expenses";
import MonthlyBudget from "@/pages/MonthlyBudget";
import SavingsGoals from "@/pages/SavingsGoals";
import Vacation from "@/pages/Vacation";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import UserSettings from "@/pages/UserSettings";
import Engagement from "@/pages/Engagement";
import AIInsights from "@/pages/AIInsights";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Admin from "@/pages/Admin";
import BlogImageUpdater from "@/pages/BlogImageUpdater";
import UpdateSitemap from "@/pages/UpdateSitemap";
import GenerateBlogImages from "@/pages/GenerateBlogImages";
import Gifts from "@/pages/Gifts";
// Marketplace removed
import AboutUs from "@/pages/AboutUs";
import ContactUs from "@/pages/ContactUs";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsAndConditions from "@/pages/TermsAndConditions";
import Disclaimer from "@/pages/Disclaimer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useState, createContext } from "react";
import { isNativeApp } from "@/utils/capacitor";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Main App Routes Component (needs to be inside HouseholdProvider)
const AppRoutes = () => {
  const location = useLocation();
  const isMobileApp = isNativeApp();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
  
  // Mobile app routes - calculator pages for subscribers only
  if (isMobileApp) {
    return (
      <Routes>
        <Route path="/" element={<MobileLanding />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/expenses" element={<SubscriptionGuard><Expenses /></SubscriptionGuard>} />
        <Route path="/budget" element={<SubscriptionGuard><MonthlyBudget /></SubscriptionGuard>} />
        <Route path="/savings" element={<SubscriptionGuard><SavingsGoals /></SubscriptionGuard>} />
        <Route path="/vacation" element={<SubscriptionGuard><Vacation /></SubscriptionGuard>} />
        <Route path="/gifts" element={<SubscriptionGuard><Gifts /></SubscriptionGuard>} />
        <Route path="/ai-insights" element={<SubscriptionGuard><AIInsights /></SubscriptionGuard>} />
        <Route path="/settings" element={<SubscriptionGuard><UserSettings /></SubscriptionGuard>} />
        <Route path="*" element={<MobileLanding />} />
      </Routes>
    );
  }
  
  // Full web app routes
  
  return (
    <Routes>
      <Route path="/" element={<MonthlyBudget />} />
      <Route path="/budget" element={<MonthlyBudget />} />
      <Route path="/expenses" element={<Expenses />} />
      <Route path="/savings" element={<SavingsGoals />} />
      <Route path="/vacation" element={<Vacation />} />
      <Route path="/engagement" element={<Engagement />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/settings" element={<UserSettings />} />
      <Route path="/gifts" element={<Gifts />} />
      {/* Marketplace removed */}
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/admin" element={<Admin />} />
        <Route path="/admin/blog-images" element={<BlogImageUpdater />} />
        <Route path="/admin/update-sitemap" element={<UpdateSitemap

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
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
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
import { Gifts } from "@/pages/Gifts";
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

const queryClient = new QueryClient();

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
      <Route path="/" element={<Home />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/budget" element={<MonthlyBudget />} />
      <Route path="/expenses" element={<Expenses />} />
      <Route path="/savings" element={<SavingsGoals />} />
      <Route path="/home" element={<Home />} />
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
        <Route path="/admin/update-sitemap" element={<UpdateSitemap />} />
        <Route path="/admin/generate-blog-images" element={<GenerateBlogImages />} />
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

// Layout component that uses hooks
const AppLayout = () => {
  const { loading: authLoading, user } = useAuth();
  const isMobile = useIsMobile();
  const isMobileApp = isNativeApp();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isLandingPage = location.pathname === '/landing';

  // Show splash screen while auth is initializing
  // For logged-in users, we wait a bit longer to let subscription/profile load
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  useEffect(() => {
    if (!authLoading) {
      // If no user, show content immediately
      if (!user) {
        setInitialLoadComplete(true);
      } else {
        // For logged-in users, give a brief delay for subscription/profile to load
        const timer = setTimeout(() => {
          setInitialLoadComplete(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [authLoading, user]);

  if (authLoading || !initialLoadComplete) {
    return <SplashScreen isLoading={true} />;
  }

  // Simplified layout for mobile app
  if (isMobileApp) {
    // Landing/auth pages - no header or nav
    const isAuthPage = location.pathname === '/mobile-landing' || location.pathname === '/auth';
    if (isAuthPage) {
      return (
        <div className="min-h-screen w-full flex flex-col bg-background">
          <main id="main-content" className="flex-1">
            <AppRoutes />
          </main>
        </div>
      );
    }

    // Regular pages with header and nav
    return (
      <div 
        className="min-h-screen w-full flex flex-col relative" 
        style={{ 
          paddingTop: 'calc(env(safe-area-inset-top) + 120px)',
          backgroundColor: 'hsl(var(--primary))',
        }}
      >
        {/* Background gradient from top */}
        <div 
          className="fixed top-0 left-0 right-0 pointer-events-none z-0"
          style={{
            height: 'calc(env(safe-area-inset-top) + 180px)',
            background: 'linear-gradient(to bottom, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.6) 50%, transparent 100%)',
          }}
        />
        <div className="fixed top-0 left-0 right-0 z-30" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <MobileAppHeader />
        </div>
        <main id="main-content" className="flex-1 p-4 pb-20 overflow-auto relative z-10">
          <AppRoutes />
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  // Full web app layout
  // Home, landing, and auth pages - minimal layout with no header/sidebar
  const isAuthPage = location.pathname === '/auth';
  if (isHomePage || isLandingPage || isAuthPage) {
    return (
      <div className="min-h-screen w-full flex flex-col">
        <main id="main-content" className="flex-1">
          <AppRoutes />
        </main>
      </div>
    );
  }

  // Features page and regular pages with full navigation
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full flex flex-col bg-background">
        <Header />
        <div className="flex flex-1">
          {!isMobile && <AppSidebar />}
          <div className="flex-1 flex flex-col min-w-0">
            {isMobile && <AppSidebar />}
            <main id="main-content" className="flex-1 p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </div>
        {isMobile && <MobileBottomNav />}
      </div>
    </SidebarProvider>
  );
};

const App = () => {
  const [currency, setCurrency] = useState(defaultCurrency);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <AuthProvider>
              <SubscriptionProvider>
                <YearProvider>
                  <HouseholdProvider>
                    <CurrencyContext.Provider value={{ currency, setCurrency }}>
                      <BrowserRouter>
                        <SkipToMain />
                        <ScrollToTop />
                        <AppLayout />
                      </BrowserRouter>
                    </CurrencyContext.Provider>
                  </HouseholdProvider>
                </YearProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </ErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
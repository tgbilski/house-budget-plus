import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SkipToMain } from "@/components/SkipToMain";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobileAppHeader } from "@/components/MobileAppHeader";
// SubscriptionGuard lazy-loaded below
import { SplashScreen } from "@/components/SplashScreen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { trackPageView } from "@/utils/analytics";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SubscriptionProvider, useSubscription } from "@/hooks/useSubscription";
import { YearProvider } from "@/hooks/useYear";
import { HouseholdProvider } from "@/providers/HouseholdProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { PageReadyProvider, usePageReady } from "@/hooks/usePageReady";
import Header from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import ScrollToTop from "@/components/ScrollToTop";
import Footer from "@/components/Footer";
import { JazzBackground } from "@/components/JazzBackground";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { PageSkeleton } from "@/components/LoadingSkeletons";
import { useState, createContext } from "react";
import { isNativeApp } from "@/utils/capacitor";

// Lazy-loaded route components
const MobileLanding = lazy(() => import("@/pages/MobileLanding"));
const Expenses = lazy(() => import("@/pages/Expenses"));
const MonthlyBudget = lazy(() => import("@/pages/MonthlyBudget"));
const SavingsGoals = lazy(() => import("@/pages/SavingsGoals"));
const Auth = lazy(() => import("@/pages/Auth"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const SubscriptionSuccess = lazy(() => import("@/pages/SubscriptionSuccess"));
const UserSettings = lazy(() => import("@/pages/UserSettings"));
const Admin = lazy(() => import("@/pages/Admin"));
const AboutUs = lazy(() => import("@/pages/AboutUs"));
const ContactUs = lazy(() => import("@/pages/ContactUs"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("@/pages/TermsAndConditions"));
const Disclaimer = lazy(() => import("@/pages/Disclaimer"));
const SubscriptionGuard = lazy(() => import("@/components/SubscriptionGuard").then(m => ({ default: m.SubscriptionGuard })));

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
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<MobileLanding />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
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
      </Suspense>
    );
  }
  
  // Full web app routes
  
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<MonthlyBudget />} />
        <Route path="/budget" element={<MonthlyBudget />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/savings" element={<SavingsGoals />} />
        <Route path="/vacation" element={<Vacation />} />
        <Route path="/engagement" element={<Engagement />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
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
        <Route path="/house-comparison" element={<HouseComparison />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

// Layout component that uses hooks
const AppLayout = () => {
  const { loading: authLoading } = useAuth();
  const { checkoutLoading } = useSubscription();
  const { isPageReady, resetPageReady } = usePageReady();
  const isMobile = useIsMobile();
  const isMobileApp = isNativeApp();
  const location = useLocation();
  const [authComplete, setAuthComplete] = useState(false);
  const [maxTimeoutReached, setMaxTimeoutReached] = useState(false);
  
  // Reset page ready state and timeout on route change
  useEffect(() => {
    resetPageReady();
    setMaxTimeoutReached(false);
  }, [location.pathname, resetPageReady]);
  
  // Mark auth as complete once loading finishes
  useEffect(() => {
    if (!authLoading) {
      setAuthComplete(true);
    }
  }, [authLoading]);

  // Show splash screen until both auth is complete AND page content signals ready
  // Include a max timeout of 3 seconds as fallback
  useEffect(() => {
    if (authComplete && !isPageReady && !maxTimeoutReached) {
      const timer = setTimeout(() => {
        setMaxTimeoutReached(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [authComplete, isPageReady, maxTimeoutReached]);

  // Show splash during initial load, page transitions, or checkout
  const showSplash = !authComplete || (!isPageReady && !maxTimeoutReached) || checkoutLoading;

  if (showSplash) {
    return <SplashScreen isLoading={true} />;
  }

  // Simplified layout for mobile app
  if (isMobileApp) {
    // Landing/auth pages - no header or nav
    const isAuthPage = location.pathname === '/mobile-landing' || location.pathname === '/auth' || location.pathname === '/login' || location.pathname === '/signup';
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
  // Auth page - minimal layout with no header/sidebar
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/login' || location.pathname === '/signup';
  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full flex flex-col">
        <main id="main-content" className="flex-1">
          <AppRoutes />
        </main>
      </div>
    );
  }

  // All other pages with full navigation (including root "/")
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen w-full flex flex-col bg-background relative">
        <JazzBackground />
        <Header />
        <div className="flex flex-1">
          {!isMobile && <AppSidebar />}
          <div className={cn("flex-1 flex flex-col min-w-0", !isMobile && "ml-44")}>
            {isMobile && <AppSidebar />}
            <main id="main-content" className="flex-1 p-2 sm:p-4 md:p-6 pb-20 md:pb-6 relative z-10">
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
        <TooltipProvider delayDuration={300}>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <AuthProvider>
              <SubscriptionProvider>
                <YearProvider>
                  <HouseholdProvider>
                    <CurrencyContext.Provider value={{ currency, setCurrency }}>
                      <PageReadyProvider>
                        <BrowserRouter>
                          <SkipToMain />
                          <ScrollToTop />
                          <AppLayout />
                        </BrowserRouter>
                      </PageReadyProvider>
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

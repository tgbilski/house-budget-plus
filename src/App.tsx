import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SkipToMain } from "@/components/SkipToMain";
import { MobileAppHeader } from "@/components/MobileAppHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
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
import { PageReadyProvider, usePageReady } from "@/hooks/usePageReady";
import DashboardHeader from "@/components/DashboardHeader";
import ScrollToTop from "@/components/ScrollToTop";
import Footer from "@/components/Footer";
import { JazzBackground } from "@/components/JazzBackground";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageSkeleton } from "@/components/LoadingSkeletons";
import { useState, createContext } from "react";
import { isNativeApp } from "@/utils/capacitor";

// Lazy-loaded route components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const MobileLanding = lazy(() => import("@/pages/MobileLanding"));
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
      staleTime: 1000 * 60 * 5,
    },
  },
});

const AppRoutes = () => {
  const location = useLocation();
  const isMobileApp = isNativeApp();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
  
  if (isMobileApp) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<MobileLanding />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/budget" element={<SubscriptionGuard><Dashboard /></SubscriptionGuard>} />
          <Route path="/settings" element={<SubscriptionGuard><UserSettings /></SubscriptionGuard>} />
          <Route path="*" element={<MobileLanding />} />
        </Routes>
      </Suspense>
    );
  }
  
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/budget" element={<Dashboard />} />
        <Route path="/expenses" element={<Dashboard />} />
        <Route path="/savings" element={<Dashboard />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/settings" element={<UserSettings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/subscription-success" element={<SubscriptionSuccess />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const TOOL_ROUTES = ['/', '/budget', '/expenses', '/savings', '/settings', '/admin'];

const FooterWrapper = () => {
  const location = useLocation();
  const isToolPage = TOOL_ROUTES.includes(location.pathname);
  if (isToolPage) return null;
  return <Footer />;

const AppLayout = () => {
  const { loading: authLoading } = useAuth();
  const { checkoutLoading } = useSubscription();
  const { isPageReady, resetPageReady } = usePageReady();
  const isMobileApp = isNativeApp();
  const location = useLocation();
  const [authComplete, setAuthComplete] = useState(false);
  const [maxTimeoutReached, setMaxTimeoutReached] = useState(false);
  
  useEffect(() => {
    resetPageReady();
    setMaxTimeoutReached(false);
  }, [location.pathname, resetPageReady]);
  
  useEffect(() => {
    if (!authLoading) setAuthComplete(true);
  }, [authLoading]);

  useEffect(() => {
    if (authComplete && !isPageReady && !maxTimeoutReached) {
      const timer = setTimeout(() => setMaxTimeoutReached(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [authComplete, isPageReady, maxTimeoutReached]);

  const showSplash = !authComplete || (!isPageReady && !maxTimeoutReached) || checkoutLoading;

  if (showSplash) {
    return <SplashScreen isLoading={true} />;
  }

  // Mobile app layout
  if (isMobileApp) {
    const isAuthPage = ['/mobile-landing', '/auth', '/login', '/signup', '/'].includes(location.pathname);
    if (isAuthPage) {
      return (
        <div className="min-h-screen w-full flex flex-col bg-background">
          <main id="main-content" className="flex-1"><AppRoutes /></main>
        </div>
      );
    }
    return (
      <div className="min-h-screen w-full flex flex-col relative"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 120px)', backgroundColor: 'hsl(var(--primary))' }}>
        <div className="fixed top-0 left-0 right-0 pointer-events-none z-0"
          style={{ height: 'calc(env(safe-area-inset-top) + 180px)', background: 'linear-gradient(to bottom, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.6) 50%, transparent 100%)' }} />
        <div className="fixed top-0 left-0 right-0 z-30" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <MobileAppHeader />
        </div>
        <main id="main-content" className="flex-1 p-4 pb-20 overflow-auto relative z-10"><AppRoutes /></main>
        <MobileBottomNav />
      </div>
    );
  }

  // Auth pages — minimal
  const isAuthPage = ['/auth', '/login', '/signup'].includes(location.pathname);
  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full flex flex-col">
        <main id="main-content" className="flex-1"><AppRoutes /></main>
      </div>
    );
  }

  // Main web layout — no sidebar, simple header
  return (
    <div className="min-h-screen w-full flex flex-col bg-background relative">
      <JazzBackground />
      <DashboardHeader />
      <main id="main-content" className="flex-1 relative z-10">
        <AppRoutes />
      </main>
      <FooterWrapper />
    </div>
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

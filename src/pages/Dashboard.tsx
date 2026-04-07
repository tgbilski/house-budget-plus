import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePageReady } from '@/hooks/usePageReady';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSubscription } from '@/hooks/useSubscription';
import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { WarningBanner } from '@/components/WarningBanner';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import { AffiliateRecommendations } from '@/components/AffiliateRecommendations';

import FeedbackForm from '@/components/FeedbackForm';
import BudgetSection from '@/components/dashboard/BudgetSection';
import ExpensesSection from '@/components/dashboard/ExpensesSection';
import SavingsSection from '@/components/dashboard/SavingsSection';
import GuestPreviewCards from '@/components/dashboard/GuestPreviewCards';
import calculatorMascot from '@/assets/calculator-mascot.png';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { setPageReady } = usePageReady();
  const isMobile = useIsMobile();
  const { subscribed } = useSubscription();

  useEffect(() => {
    requestAnimationFrame(() => setPageReady());
  }, [setPageReady]);

  return (
    <div className="min-h-screen">
      <SEO
        title={seoData.monthlyBudget.title}
        description={seoData.monthlyBudget.description}
        keywords={seoData.monthlyBudget.keywords}
        structuredData={seoData.monthlyBudget.structuredData}
        canonical={seoData.monthlyBudget.canonical}
        ogImage={seoData.monthlyBudget.ogImage}
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <WarningBanner />

        {/* Guest Welcome Hero */}
        {!user && (
          <div className="relative z-10 mb-8">
            <div className="text-center stagger-1">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-5 animate-bounce-in">
                <img src={calculatorMascot} alt="House Budget Calculator Mascot" className="w-20 h-20 object-contain" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-teal bg-clip-text text-transparent mb-4">
                Welcome to House Budget Calculator
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
                The all-in-one budgeting toolkit for your household — plan your monthly budget, track daily expenses, and grow your savings with smart tools.
              </p>
            </div>

            {/* Scroll indicator */}
            <div className="flex justify-center mt-6 stagger-2">
              <div className="flex flex-col items-center gap-1 text-muted-foreground/50">
                <span className="text-xs uppercase tracking-widest">Start budgeting below</span>
                <svg className="w-5 h-5 animate-scroll-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* Decorative divider */}
            <div className="flex items-center gap-4 mt-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground/60 font-medium">Your Budget</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal/30 to-transparent" />
            </div>
          </div>
        )}

        <div className={isMobile ? "space-y-4" : "space-y-12"}>
          <BudgetSection />

          {user ? (
            <>
              {!isMobile && <hr className="border-t-[3px] border-stroke/20" />}
              <SavingsSection />
              
              {!isMobile && <hr className="border-t-[3px] border-stroke/20" />}
              {subscribed ? (
                <ExpensesSection />
              ) : (
                <section className="animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                  <div className="w-full rounded-xl border-[3px] border-stroke bg-card shadow-cartoon p-6 text-center space-y-3">
                    <div className="flex justify-center">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Lock className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Expense Tracker</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Track daily expenses with voice input, charts, and category breakdowns. Upgrade to unlock.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-success font-medium">
                      <Sparkles className="h-4 w-4" />
                      Less than a coffee — $2.99/mo
                    </div>
                    <Link to="/settings">
                      <Button className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold shadow-cartoon mt-2">
                        <Lock className="h-4 w-4 mr-2" />
                        Unlock Premium
                      </Button>
                    </Link>
                  </div>
                </section>
              )}
            </>
          ) : (
            /* Guest: show preview cards with demo data */
            <>
              {!isMobile && <hr className="border-t-[3px] border-stroke/20" />}
              <GuestPreviewCards />
            </>
          )}
        </div>

        
        <div className="mt-6">
          <FeedbackForm pageSource="dashboard" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

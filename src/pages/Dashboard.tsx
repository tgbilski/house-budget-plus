import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePageReady } from '@/hooks/usePageReady';
import { useIsMobile } from '@/hooks/use-mobile';
import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { WarningBanner } from '@/components/WarningBanner';

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
              <ExpensesSection />
              
              {!isMobile && <hr className="border-t-[3px] border-stroke/20" />}
              <SavingsSection />
            </>
          ) : (
            /* Guest: show preview cards with demo data */
            <>
              {!isMobile && <hr className="border-t-[3px] border-stroke/20" />}
              <GuestPreviewCards />
            </>
          )}
        </div>

        {user && (
          <div className="mt-8">
            <BadgeDisplay />
          </div>
        )}
        
        <div className="mt-6">
          <FeedbackForm pageSource="dashboard" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

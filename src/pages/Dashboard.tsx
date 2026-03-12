import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePageReady } from '@/hooks/usePageReady';
import { useIsMobile } from '@/hooks/use-mobile';
import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { WarningBanner } from '@/components/WarningBanner';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import InlineSignUpForm from '@/components/InlineSignUpForm';
import FeedbackForm from '@/components/FeedbackForm';
import BudgetSection from '@/components/dashboard/BudgetSection';
import ExpensesSection from '@/components/dashboard/ExpensesSection';
import SavingsSection from '@/components/dashboard/SavingsSection';

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

        {/* Scrollable sections (desktop) / Card feed (mobile) */}
        <div className={isMobile ? "space-y-4" : "space-y-12"}>
          <BudgetSection />

          {user && (
            <>
              {/* Divider on desktop */}
              {!isMobile && <hr className="border-t-[3px] border-stroke/20" />}
              <ExpensesSection />
              
              {!isMobile && <hr className="border-t-[3px] border-stroke/20" />}
              <SavingsSection />
            </>
          )}
        </div>

        {/* Guest CTA */}
        {!user && (
          <div className="mt-8 space-y-4 max-w-lg mx-auto">
            <div className="bg-card border-[3px] border-stroke rounded-xl p-5 shadow-cartoon">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Adulting is hard. Budgeting doesn't have to be. 😤
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                Sign up to save your data, track expenses, and set savings goals:
              </p>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-lg leading-none">🔒</span>
                  <span className="text-foreground"><strong>Your data, saved forever</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg leading-none">🧾</span>
                  <span className="text-foreground"><strong>Voice expense tracking</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg leading-none">🎯</span>
                  <span className="text-foreground"><strong>Savings goals tracker</strong></span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground italic">No credit card needed. 🫡</p>
            </div>
            <InlineSignUpForm />
          </div>
        )}

        {/* Footer content */}
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

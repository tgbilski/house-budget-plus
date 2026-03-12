import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePageReady } from '@/hooks/usePageReady';
import { useIsMobile } from '@/hooks/use-mobile';
import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { WarningBanner } from '@/components/WarningBanner';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import FeedbackForm from '@/components/FeedbackForm';
import BudgetSection from '@/components/dashboard/BudgetSection';
import ExpensesSection from '@/components/dashboard/ExpensesSection';
import SavingsSection from '@/components/dashboard/SavingsSection';
import GuestPreviewCards from '@/components/dashboard/GuestPreviewCards';

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

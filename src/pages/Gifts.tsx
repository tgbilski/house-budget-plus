import React, { useEffect } from 'react';
import { SEO } from '@/components/SEO';
import { GiftsTable } from '@/components/GiftsTable';
import { FAQ } from '@/components/FAQ';
import { InternalLinks } from '@/components/InternalLinks';
import { useAuth } from '@/hooks/useAuth';
import { useBadges } from '@/hooks/useBadges';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import InlineSignUpForm from '@/components/InlineSignUpForm';
import { PageSEOContent, pageSEOData } from '@/components/PageSEOContent';
import calculatorMascot from '@/assets/calculator-mascot.png';

const Gifts: React.FC = () => {
  const { user } = useAuth();
  const { earnBadge } = useBadges();

  // Award badge when user visits the gifts page while logged in
  useEffect(() => {
    if (user) {
      earnBadge('gifts');
    }
  }, [user, earnBadge]);

  return (
    <>
      <SEO
        title="Gift Lists - Track Gift Ideas & Budget | House Budget Calculator"
        description="Organize your gift ideas by occasion and recipient. Track prices, links, and purchased status all in one place."
        keywords="gift tracker, gift ideas, gift budget, holiday gifts, birthday gifts, gift planning"
        canonical="https://house-budget-plus.lovable.app/gifts"
      />

      <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <img
            src={calculatorMascot}
            alt="Calculator mascot"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
            Gift Lists
          </h1>
        </div>

        {/* Main Content */}
        {user ? (
          <GiftsTable />
        ) : (
          <div className="space-y-6">
            <InlineSignUpForm />
            <p className="text-center text-muted-foreground">
              Sign up to start tracking your gift ideas!
            </p>
          </div>
        )}

        {/* Badge Display and FAQ */}
        {user && <BadgeDisplay />}
        
        <FAQ 
          faqs={[
            {
              question: "How do I add a gift idea?",
              answer: "Select an occasion from the dropdown, enter the recipient's name, and click the + button. You can also add the gift idea, price, and a link to where you can purchase it."
            },
            {
              question: "Can I track which gifts I've already purchased?",
              answer: "Yes! Check the 'Done' checkbox next to any gift to mark it as purchased. This helps you keep track of what's left to buy."
            },
            {
              question: "What occasions are available?",
              answer: "We include popular US holidays and occasions like Christmas, Birthdays, Valentine's Day, Mother's Day, Father's Day, Graduation, and more - all sorted alphabetically for easy access."
            },
            {
              question: "Can I share my gift list with others?",
              answer: "If you're part of a household, all household members can see and edit the gift list. This makes coordinating gifts for family events much easier."
            }
          ]}
          title="Gift List FAQs"
        />

        <InternalLinks currentPage="/gifts" category="planning" />
        
        <PageSEOContent
          title={pageSEOData.gifts.title}
          description={pageSEOData.gifts.description}
          features={pageSEOData.gifts.features}
          keywords={pageSEOData.gifts.keywords}
        />
      </div>
    </>
  );
};

export default Gifts;

// src/pages/Gifts.tsx (Final Version)
import React, { useEffect } from 'react';
import { useGiftLists } from '@/hooks/useGiftLists';
import { useAuth } from '@/hooks/useAuth';
import { useBadges } from '@/hooks/useBadges';
import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { WarningBanner } from '@/components/WarningBanner';
import { GiftListSelector } from '@/components/GiftListSelector';
import { GiftCardDisplay } from '@/components/GiftCardDisplay';
import { YearSelector } from '@/components/YearSelector';
import { Gift, AlertTriangle, ShoppingBag } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InternalLinks } from '@/components/InternalLinks';
import { FAQ } from '@/components/FAQ';

export function Gifts() {
  const { user } = useAuth();
  const { earnBadge } = useBadges();
  const navigate = useNavigate();
  // 1. The page's only job is to call our main hook to get the data.
  const {
    loading,
    giftLists,
    selectedList,
    editingListId,
    editingTitle,
    setEditingTitle,
    selectList,
    startEditing,
    saveTitle,
    cancelEditing,
    loadGiftLists
  } = useGiftLists();

  // Award badge when user has gift lists
  useEffect(() => {
    if (user && giftLists.length > 0) {
      earnBadge('gifts');
    }
  }, [user, giftLists.length, earnBadge]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600 animate-pulse">Loading your gift lists...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={seoData.gifts.title}
        description={seoData.gifts.description}
        keywords={seoData.gifts.keywords}
        canonical={seoData.gifts.canonical}
        ogImage={seoData.gifts.ogImage}
        structuredData={seoData.gifts.structuredData}
      />
      
      <div className="max-w-7xl mx-auto p-4">
        {/* Enhanced header with gradient background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background via-teal/5 to-sage/10 border border-teal/20 p-6 mb-6 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col lg:items-start space-y-2">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal to-teal/60 rounded-2xl shadow-lg">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-teal bg-clip-text text-transparent">
                    Gift Lists
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Organize ideas for every occasion
                  </p>
                </div>
              </div>
            </div>
            
            {/* Year selector at top right on laptop, centered on mobile */}
            <div className="flex justify-center lg:justify-end">
              <YearSelector />
            </div>
          </div>
        </div>

        <WarningBanner />

        {!user && (
          <Alert className="border-yellow-200 bg-yellow-50 mb-6">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Demo Mode</strong> -
              <Link to="/auth" className="underline font-medium ml-1 hover:text-yellow-900">
                Sign in to save your gift lists
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* 2. It renders the selector and passes down the data and functions it needs. */}
          <GiftListSelector
            giftLists={giftLists}
            selectedList={selectedList}
            editingListId={editingListId}
            editingTitle={editingTitle}
            onSelectList={selectList}
            onStartEditing={startEditing}
            onSaveTitle={saveTitle}
            onCancelEditing={cancelEditing}
            onSetEditingTitle={setEditingTitle}
          />

          <div className="flex justify-end">
            <Button 
              onClick={() => navigate('/marketplace')} 
              variant="outline" 
              className="gap-2"
            >
              <ShoppingBag className="h-4 w-4" /> Find Gift Ideas
            </Button>
          </div>

          {/* 3. It renders the gift card display area for the selected list. */}
          <GiftCardDisplay
            selectedList={selectedList}
            onSave={loadGiftLists}
          />

          <FAQ 
            faqs={[
              {
                question: "How do I create a new gift list?",
                answer: "Click on the gift list dropdown at the top of the page. The system automatically creates lists for you - just select the occasion you want to plan for."
              },
              {
                question: "Can I set a budget for my gift list?",
                answer: "Yes! Each gift item can have a price estimate. Add your gifts and their estimated costs to track your total gift spending for the occasion."
              },
              {
                question: "How do I track which gifts I've already purchased?",
                answer: "You can mark gifts as purchased by checking them off your list. This helps you keep track of what's left to buy."
              },
              {
                question: "Can I share my gift lists with others?",
                answer: "Currently, gift lists are private to your account. This feature helps you plan surprise gifts without others seeing your ideas."
              }
            ]}
            title="Gift List FAQs"
          />

          <InternalLinks currentPage="/gifts" category="planning" />
        </div>
      </div>
    </div>
  );
}

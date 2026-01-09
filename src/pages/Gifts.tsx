// src/pages/Gifts.tsx (Final Version)
import React, { useEffect, useMemo } from 'react';
import { useGiftLists, useGiftItems } from '@/hooks/useGiftLists';
import { useAuth } from '@/hooks/useAuth';
import { useBadges } from '@/hooks/useBadges';
import { useCurrency } from '@/hooks/useCurrency';
import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { WarningBanner } from '@/components/WarningBanner';
import { GiftListSelector } from '@/components/GiftListSelector';
import { GiftCardDisplay } from '@/components/GiftCardDisplay';
import { GiftBudgetSummary } from '@/components/GiftBudgetSummary';

import { YearSelector } from '@/components/YearSelector';
import { EventCalendar } from '@/components/EventCalendar';
import { EventAlertDialog } from '@/components/EventAlertDialog';

import { InternalLinks } from '@/components/InternalLinks';
import { FAQ } from '@/components/FAQ';
import { differenceInDays, startOfDay, parseISO } from 'date-fns';
import calculatorMascot from '@/assets/calculator-mascot.png';

export function Gifts() {
  const { user } = useAuth();
  const { earnBadge } = useBadges();
  const { currency } = useCurrency();
  
  
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
    loadGiftLists,
    updateEventDate,
    dismissOneWeekAlert
  } = useGiftLists();

  // Get gift items for the selected list to calculate totals
  const { items, refetchItems } = useGiftItems(selectedList?.id);

  // Award badge when user has gift lists
  useEffect(() => {
    if (user && giftLists.length > 0) {
      earnBadge('gifts');
    }
  }, [user, giftLists.length, earnBadge]);

  // Calculate budget summary from actual gift items
  const totalBudget = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const itemCount = items.length;

  // Check if we should show the one-week alert
  const shouldShowAlert = useMemo(() => {
    if (!selectedList?.event_date || selectedList.one_week_alert_dismissed) return false;
    const eventDate = parseISO(selectedList.event_date);
    const today = startOfDay(new Date());
    const daysUntil = differenceInDays(startOfDay(eventDate), today);
    return daysUntil === 7;
  }, [selectedList?.event_date, selectedList?.one_week_alert_dismissed]);

  const handleEventDateSelect = (date: Date | undefined) => {
    if (selectedList) {
      updateEventDate(selectedList.id, date || null);
    }
  };

  const handleDismissAlert = () => {
    if (selectedList) {
      dismissOneWeekAlert(selectedList.id);
    }
  };

  const eventDate = selectedList?.event_date ? parseISO(selectedList.event_date) : undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-lg text-muted-foreground">Loading your gift lists...</p>
        </div>
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
      
      <div className="max-w-7xl mx-auto pt-2 px-4">
        {/* Header - matching Monthly Budget style */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img 
              src={calculatorMascot} 
              alt="Budget Calculator Mascot" 
              className="w-12 h-12 md:w-16 md:h-16 object-contain"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-wide">
              GIFT LISTS
            </h1>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
            <p className="text-xs text-muted-foreground mb-1 text-center">Budget Year</p>
            <YearSelector />
          </div>
        </div>

        <WarningBanner />

        <div className="space-y-6">
          {/* Budget Summary */}
          <GiftBudgetSummary
            totalBudget={totalBudget}
            itemCount={itemCount}
            currencySymbol={currency.symbol}
          />

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


          {/* 3. Main content with gift cards and calendar on desktop */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <GiftCardDisplay
                selectedList={selectedList}
                onSave={loadGiftLists}
                onItemsChange={refetchItems}
              />
            </div>
            
            {/* Calendar sidebar - desktop only */}
            <div className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-4">
                <EventCalendar
                  eventDate={eventDate}
                  onDateSelect={handleEventDateSelect}
                  listTitle={selectedList?.list_title || 'Event'}
                  disabled={!user || selectedList?.id.startsWith('demo-')}
                />
              </div>
            </div>
          </div>

          {/* One-week alert dialog */}
          {selectedList && shouldShowAlert && eventDate && (
            <EventAlertDialog
              open={shouldShowAlert}
              onDismiss={handleDismissAlert}
              listTitle={selectedList.list_title}
              eventDate={eventDate}
            />
          )}

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


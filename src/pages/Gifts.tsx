// src/pages/Gifts.tsx (Final Version)
import React, { useEffect, useState, useMemo } from 'react';
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
import { GiftSearch } from '@/components/GiftSearch';
import { YearSelector } from '@/components/YearSelector';
import { EventCalendar } from '@/components/EventCalendar';
import { EventAlertDialog } from '@/components/EventAlertDialog';
import { Gift, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InternalLinks } from '@/components/InternalLinks';
import { FAQ } from '@/components/FAQ';
import { differenceInDays, startOfDay, parseISO } from 'date-fns';
import heroGiftsImg from '@/assets/hero-gifts.png';

export function Gifts() {
  const { user } = useAuth();
  const { earnBadge } = useBadges();
  const { currency } = useCurrency();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
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
      
      <div className="max-w-7xl mx-auto p-4">
        {/* Enhanced header with background image */}
        <div className="relative overflow-hidden rounded-2xl mb-6 shadow-lg">
          <img 
            src={heroGiftsImg} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
          <div className="relative p-6">
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

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="w-full sm:w-96">
              <GiftSearch value={searchQuery} onChange={setSearchQuery} />
            </div>
            <Button 
              onClick={() => navigate('/marketplace')} 
              variant="outline" 
              className="gap-2 w-full sm:w-auto"
            >
              <ShoppingBag className="h-4 w-4" /> Find Gift Ideas
            </Button>
          </div>

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


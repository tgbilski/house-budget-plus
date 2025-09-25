// src/pages/Gifts.tsx (Final Version)
import React from 'react';
import { useGiftLists } from '@/hooks/useGiftLists';
import { SEO } from '@/components/SEO';
import { WarningBanner } from '@/components/WarningBanner';
import { GiftListSelector } from '@/components/GiftListSelector';
import { GiftCardDisplay } from '@/components/GiftCardDisplay';
import { YearSelector } from '@/components/YearSelector';
import { Gift } from 'lucide-react';
// Note: Imports for components like EtsyProducts, AIChatbot, etc., would also go here

export function Gifts() {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {/* You can put your detailed loading skeleton here */}
        <p className="text-lg text-gray-600">Loading your gift lists...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Gift Lists" 
        description="Organize your gift ideas for every occasion."
      />
      
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gift Lists</h1>
                <p className="text-sm text-gray-600">Organize ideas for every occasion</p>
              </div>
            </div>
            <YearSelector />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <WarningBanner />

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

        {/* 3. It renders the gift card display area for the selected list. */}
        <GiftCardDisplay
          selectedList={selectedList}
          onSave={loadGiftLists}
        />

        {/* You can add your other page sections below */}
        {/* <EtsyProducts shopName="The90sKidShop" /> */}
        {/* <AIChatbot pageContext="..." pageName="Gifts" /> */}
      </div>
    </div>
  );
}

// src/pages/Gifts.tsx (Final Version)
import React, { useEffect } from 'react';
import { useGiftLists } from '@/hooks/useGiftLists';
import { useAuth } from '@/hooks/useAuth';
import { useBadges } from '@/hooks/useBadges';
import { SEO } from '@/components/SEO';
import { WarningBanner } from '@/components/WarningBanner';
import { GiftListSelector } from '@/components/GiftListSelector';
import { GiftCardDisplay } from '@/components/GiftCardDisplay';
import { YearSelector } from '@/components/YearSelector';
import { Gift, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';

export function Gifts() {
  const { user } = useAuth();
  const { earnBadge } = useBadges();
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
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Gift Lists" 
        description="Organize your gift ideas for every occasion."
        keywords="gift lists, gift ideas, holiday planning, birthday gifts, gift organization"
      />
      
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Year selector at top right on laptop */}
          <div className="hidden lg:flex justify-end mb-4">
            <YearSelector />
          </div>
          
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-teal/20 rounded-full">
                <Gift className="h-6 w-6 text-teal" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gift Lists</h1>
                <p className="text-sm text-gray-600 bg-sage/30 px-2 py-1 rounded-md">Organize ideas for every occasion</p>
              </div>
            </div>
            
            {/* Year selector for mobile/tablet */}
            <div className="lg:hidden flex justify-center w-full">
              <YearSelector />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
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
      </div>
    </div>
  );
}

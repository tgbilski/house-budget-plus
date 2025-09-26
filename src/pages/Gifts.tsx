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
    <div className="min-h-screen bg-background">
      <SEO 
        title="Gift Lists" 
        description="Organize your gift ideas for every occasion."
        keywords="gift lists, gift ideas, holiday planning, birthday gifts, gift organization"
      />
      
      <div className="max-w-7xl mx-auto p-4">
        {/* Compact header at very top */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex flex-col lg:items-start space-y-2">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-teal/20 rounded-full">
                <Gift className="h-6 w-6 text-teal" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Gift Lists</h1>
            </div>
            <p className="text-muted-foreground text-sm text-center lg:text-left bg-sage/30 px-3 py-1 rounded-md">
              Organize ideas for every occasion
            </p>
          </div>
          
          {/* Year selector at top right on laptop, centered on mobile */}
          <div className="flex justify-center lg:justify-end">
            <YearSelector />
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

          {/* 3. It renders the gift card display area for the selected list. */}
          <GiftCardDisplay
            selectedList={selectedList}
            onSave={loadGiftLists}
          />
        </div>
      </div>
    </div>
  );
}

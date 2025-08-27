import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { GiftCard } from '@/components/GiftCard';
import { useAuth } from '@/hooks/useAuth';
import { useBadges } from '@/hooks/useBadges';
import { supabase } from '@/integrations/supabase/client';

import { AIChatbot } from '@/components/AIChatbot';
import { SEO } from '@/components/SEO';
import { WarningBanner } from '@/components/WarningBanner';

interface GiftListData {
  id: string;
  list_title: string;
  created_at: string;
  updated_at: string;
}

export function Gifts() {
  const { user } = useAuth();
  const { earnBadge } = useBadges();

  // Listen for badge earning events
  useEffect(() => {
    const handleEarnBadge = (event: CustomEvent) => {
      const { badgeType } = event.detail;
      earnBadge(badgeType);
    };

    window.addEventListener('earnBadge', handleEarnBadge as EventListener);
    return () => window.removeEventListener('earnBadge', handleEarnBadge as EventListener);
  }, [earnBadge]);
  const [giftLists, setGiftLists] = useState<GiftListData[]>([]);
  const [showNewCard, setShowNewCard] = useState(false);

  useEffect(() => {
    if (user) {
      loadGiftLists();
    }
  }, [user]);

  const loadGiftLists = async () => {
    try {
      const { data, error } = await supabase
        .from('gift_lists')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGiftLists(data || []);
    } catch (error) {
      console.error('Error loading gift lists:', error);
    }
  };

  const handleDeleteList = (id: string) => {
    setGiftLists(prev => prev.filter(list => list.id !== id));
  };

  const addNewCard = () => {
    setShowNewCard(true);
  };


  const pageContext = "This is the Gifts page where users can create multiple gift list cards for different holidays or birthdays. Each card allows users to enter a gift idea, price, and URL that opens in a new tab. Users can edit the title of each card and all data is saved to their account. The AI assistant can help fill out gift information.";

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SEO 
        title="Gift Lists"
        description="Organize your gift ideas for holidays and birthdays. Keep track of gift ideas, prices, and links all in one place."
        keywords="gift lists, holiday gifts, birthday gifts, gift ideas, gift planning, gift organization"
      />
      
      {/* Hero Section with Light Background */}
      <div className="relative bg-white text-gray-900 py-8 rounded-2xl mx-4 mt-4 mb-6 shadow-xl">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <svg className="h-10 w-10 mx-auto mb-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">Gift Lists</h1>
            <p className="text-sm md:text-base text-gray-600 mb-4 max-w-2xl mx-auto">
              Organize your gift ideas for holidays, birthdays, and special occasions
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content Container */}
      <div className="bg-white rounded-2xl mx-4 my-6 shadow-xl p-6 md:p-8">
        <div className="w-full max-w-6xl mx-auto">
          <WarningBanner />
          
          <div className="mb-6">
            <Button 
              onClick={addNewCard}
              className="gap-2"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              Add New Gift List
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Show new card form */}
            {showNewCard && (
              <GiftCard 
                onDelete={() => {
                  setShowNewCard(false);
                  loadGiftLists();
                }}
              />
            )}

            {/* Existing gift lists */}
            {giftLists.map((list) => (
              <GiftCard
                key={list.id}
                initialData={list}
                onDelete={handleDeleteList}
              />
            ))}
          </div>

          {giftLists.length === 0 && !showNewCard && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                No gift lists yet. Create your first one to get started!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-2xl mx-4 my-6 shadow-xl p-6 md:p-8">
        <div className="w-full max-w-4xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">
            Never Miss a Gift Opportunity
          </h2>
          <p className="text-base text-gray-600 mb-8">
            Organize all your gift ideas and track spending for holidays, birthdays, and special occasions
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <h3 className="font-semibold mb-2 text-gray-900">Gift Organization</h3>
              <p className="text-sm text-gray-600">Create separate lists for different occasions and keep all your ideas organized</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <h3 className="font-semibold mb-2 text-gray-900">Budget Tracking</h3>
              <p className="text-sm text-gray-600">Track prices and links to ensure you stay within your gift-giving budget</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <h3 className="font-semibold mb-2 text-gray-900">Quick Access</h3>
              <p className="text-sm text-gray-600">Save direct links to gift items for easy purchasing when you're ready</p>
            </div>
          </div>
        </div>
      </div>

      <AIChatbot 
        pageContext={pageContext}
        pageName="Gifts"
      />
    </div>
  );
}

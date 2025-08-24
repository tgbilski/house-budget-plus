import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { GiftCard } from '@/components/GiftCard';
import { useAuth } from '@/hooks/useAuth';
import { useBadges } from '@/hooks/useBadges';
import { supabase } from '@/integrations/supabase/client';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { AIChatbot } from '@/components/AIChatbot';
import { SEO } from '@/components/SEO';

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

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Gifts', href: '/gifts' }
  ];

  const pageContext = "This is the Gifts page where users can create multiple gift list cards for different holidays or birthdays. Each card allows users to enter a gift idea, price, and URL that opens in a new tab. Users can edit the title of each card and all data is saved to their account. The AI assistant can help fill out gift information.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <SEO 
        title="Gift Lists"
        description="Organize your gift ideas for holidays and birthdays. Keep track of gift ideas, prices, and links all in one place."
        keywords="gift lists, holiday gifts, birthday gifts, gift ideas, gift planning, gift organization"
      />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Gift Lists
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Organize your gift ideas for holidays, birthdays, and special occasions. 
            Keep track of what to buy, how much it costs, and where to find it.
          </p>
        </div>

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
            <p className="text-muted-foreground mb-4">
              No gift lists yet. Create your first one to get started!
            </p>
            <Button onClick={addNewCard} variant="outline">
              Create Your First Gift List
            </Button>
          </div>
        )}

        {/* Dark Section with Pin Stripes - Matching Home Page */}
        <section className="py-16 px-4 bg-slate-900 text-white relative" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.04) 40px, rgba(255,255,255,0.04) 42px)`
        }}>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
              Never Miss a Gift Opportunity
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Organize all your gift ideas and track spending for holidays, birthdays, and special occasions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="font-semibold mb-2 text-white">Gift Organization</h3>
                <p className="text-sm opacity-90">Create separate lists for different occasions and keep all your ideas organized</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="font-semibold mb-2 text-white">Budget Tracking</h3>
                <p className="text-sm opacity-90">Track prices and links to ensure you stay within your gift-giving budget</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="font-semibold mb-2 text-white">Quick Access</h3>
                <p className="text-sm opacity-90">Save direct links to gift items for easy purchasing when you're ready</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <AIChatbot 
        pageContext={pageContext}
        pageName="Gifts"
      />
    </div>
  );
}

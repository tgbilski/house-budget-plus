import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Gift, Calendar, DollarSign, Search, Filter, Grid, List } from 'lucide-react';
import { GiftCard } from '@/components/GiftCard';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
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
  const { currentHousehold } = useHouseholdContext();
  const { earnBadge } = useBadges();
  const [giftLists, setGiftLists] = useState<GiftListData[]>([]);
  const [showNewCard, setShowNewCard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const handleEarnBadge = (event: CustomEvent) => {
      const { badgeType } = event.detail;
      earnBadge(badgeType);
    };

    window.addEventListener('earnBadge', handleEarnBadge as EventListener);
    return () => window.removeEventListener('earnBadge', handleEarnBadge as EventListener);
  }, [earnBadge]);

  useEffect(() => {
    if (user && currentHousehold) {
      loadGiftLists();
    }
  }, [user, currentHousehold]);

  const loadGiftLists = async () => {
    try {
      const { data, error } = await supabase
        .from('gift_lists')
        .select('*')
        .eq('user_id', user?.id)
        .eq('household_id', currentHousehold?.id)
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

  const filteredLists = giftLists.filter(list =>
    list.list_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTotalLists = () => giftLists.length;
  const getUpcomingEvents = () => {
    // This would ideally come from gift list data with dates
    return ['Holiday Season', 'Birthday Season'];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Gift Lists"
        description="Organize your gift ideas for holidays and birthdays. Keep track of gift ideas, prices, and links all in one place."
        keywords="gift lists, holiday gifts, birthday gifts, gift ideas, gift planning, gift organization"
      />
      
      {/* Modern Header */}
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
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Lists</div>
                <div className="text-2xl font-bold text-primary">{getTotalLists()}</div>
              </div>
              <Button onClick={addNewCard} className="gap-2">
                <Plus className="h-4 w-4" />
                New List
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <WarningBanner />

        {/* Stats Cards */}
        {giftLists.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Gift className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Active Lists</div>
                    <div className="text-xl font-bold">{giftLists.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Recent Activity</div>
                    <div className="text-xl font-bold">
                      {giftLists.filter(list => {
                        const created = new Date(list.created_at);
                        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                        return created > weekAgo;
                      }).length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Upcoming Events</div>
                    <div className="text-sm font-medium">
                      {getUpcomingEvents().slice(0, 2).join(', ')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search gift lists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Gift Lists Grid/List */}
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
        } mb-8`}>
          {/* New card form */}
          {showNewCard && (
            <div className={viewMode === 'list' ? 'max-w-md' : ''}>
              <GiftCard 
                onDelete={() => setShowNewCard(false)}
                onSave={() => {
                  setShowNewCard(false);
                  loadGiftLists();
                }}
              />
            </div>
          )}

          {/* Existing gift lists */}
          {filteredLists.map((list) => (
            <div key={list.id} className={viewMode === 'list' ? 'max-w-md' : ''}>
              <GiftCard
                initialData={list}
                onDelete={handleDeleteList}
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredLists.length === 0 && !showNewCard && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-12 text-center">
              <Gift className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No lists found' : 'No gift lists yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Create your first gift list to organize ideas for holidays, birthdays, and special occasions'
                }
              </p>
              {!searchQuery && (
                <Button onClick={addNewCard} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First List
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Pro Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg mt-1">
                  <Gift className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Stay Organized</h4>
                  <p className="text-sm text-gray-600">Create separate lists for different occasions like holidays, birthdays, or anniversaries.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg mt-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Track Spending</h4>
                  <p className="text-sm text-gray-600">Add prices and links to track your budget and find the best deals.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg mt-1">
                  <Calendar className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Plan Ahead</h4>
                  <p className="text-sm text-gray-600">Start collecting gift ideas throughout the year so you're always prepared.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AIChatbot 
        pageContext="This is the Gifts page where users can create multiple gift list cards for different holidays or birthdays. Each card allows users to enter a gift idea, price, and URL that opens in a new tab. Users can edit the title of each card and all data is saved to their account. The AI assistant can help fill out gift information."
        pageName="Gifts"
      />
    </div>
  );
}

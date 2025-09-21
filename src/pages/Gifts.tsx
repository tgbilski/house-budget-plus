import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Gift, Calendar, DollarSign, Search, Filter, Grid, List, Edit3, Check, X } from 'lucide-react';
import { GiftCard } from '@/components/GiftCard';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { useBadges } from '@/hooks/useBadges';
import { supabase } from '@/integrations/supabase/client';
import { AIChatbot } from '@/components/AIChatbot';
import { SEO } from '@/components/SEO';
import { WarningBanner } from '@/components/WarningBanner';
import { EtsyProducts } from '@/components/EtsyProducts';
import { YearSelector } from '@/components/YearSelector';
import { useYear } from '@/hooks/useYear';
import { cn } from '@/lib/utils';

interface GiftListData {
  id: string;
  user_id: string;
  list_title: string;
  budget_target: number;
  household_id?: string;
  year: number;
  created_at: string;
  updated_at: string;
}

export function Gifts() {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { selectedYear } = useYear();
  const { earnBadge } = useBadges();
  const [giftLists, setGiftLists] = useState<GiftListData[]>([]);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [selectedList, setSelectedList] = useState<GiftListData | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && currentHousehold) {
      loadGiftLists();
    } else {
      initializeDemoLists();
      setLoading(false);
    }
  }, [user, currentHousehold, selectedYear]);

  // Initialize 4 gift lists for demo users
  const initializeDemoLists = () => {
    const demoLists = [
      { id: 'temp-1', user_id: 'guest', list_title: 'Gift List 1', budget_target: 0, year: selectedYear, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'temp-2', user_id: 'guest', list_title: 'Gift List 2', budget_target: 0, year: selectedYear, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'temp-3', user_id: 'guest', list_title: 'Gift List 3', budget_target: 0, year: selectedYear, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'temp-4', user_id: 'guest', list_title: 'Gift List 4', budget_target: 0, year: selectedYear, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];
    setGiftLists(demoLists);
    setCurrentListId(demoLists[0].id);
    setSelectedList(demoLists[0]);
  };

  const loadGiftLists = async () => {
    if (!user || !currentHousehold) return;

    try {
      const { data: lists, error: fetchError } = await supabase
        .from('gift_lists')
        .select('*')
        .eq('user_id', user.id)
        .eq('household_id', currentHousehold.id)
        .eq('year', selectedYear)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Create all 4 gift lists if they don't exist
      const existingTitles = lists?.map(l => l.list_title) || [];
      const missingLists = [];
      
      for (let i = 1; i <= 4; i++) {
        const title = `Gift List ${i}`;
        if (!existingTitles.includes(title)) {
          missingLists.push({
            user_id: user.id,
            household_id: currentHousehold.id,
            list_title: title,
            budget_target: 0,
            year: selectedYear
          });
        }
      }

      if (missingLists.length > 0) {
        const { data: newLists, error: insertError } = await supabase
          .from('gift_lists')
          .insert(missingLists)
          .select();
        
        if (insertError) throw insertError;
        
        const allLists = [...(lists || []), ...(newLists || [])].sort((a, b) => a.list_title.localeCompare(b.list_title));
        setGiftLists(allLists);
        setCurrentListId(allLists[0].id);
        setSelectedList(allLists[0]);
      } else {
        const sortedLists = lists.sort((a, b) => a.list_title.localeCompare(b.list_title));
        setGiftLists(sortedLists);
        setCurrentListId(sortedLists[0].id);
        setSelectedList(sortedLists[0]);
      }
    } catch (error) {
      console.error('Error loading gift lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectList = (list: GiftListData) => {
    setCurrentListId(list.id);
    setSelectedList(list);
  };

  const startEditing = (list: GiftListData) => {
    setEditingListId(list.id);
    setEditingTitle(list.list_title);
  };

  const saveTitle = async (list: GiftListData) => {
    if (!user) {
      // For demo users, just update local state
      setGiftLists(prev => prev.map(l => 
        l.id === list.id ? { ...l, list_title: editingTitle } : l
      ));
      if (selectedList?.id === list.id) {
        setSelectedList({ ...list, list_title: editingTitle });
      }
    } else {
      // For authenticated users, update database
      const { error } = await supabase
        .from('gift_lists')
        .update({ list_title: editingTitle })
        .eq('id', list.id);

      if (!error) {
        setGiftLists(prev => prev.map(l => 
          l.id === list.id ? { ...l, list_title: editingTitle } : l
        ));
        if (selectedList?.id === list.id) {
          setSelectedList({ ...list, list_title: editingTitle });
        }
      }
    }
    
    setEditingListId(null);
    setEditingTitle('');
  };

  const cancelEditing = () => {
    setEditingListId(null);
    setEditingTitle('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-16 bg-gray-200 rounded w-80"></div>
          <div className="h-64 bg-gray-200 rounded w-96"></div>
        </div>
      </div>
    );
  }

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
            
            <YearSelector />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <WarningBanner />

        {/* Gift Lists Selector - Similar to other pages */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-2">
              {giftLists.map((list) => (
                <div key={list.id} className="w-full">
                  <div 
                    className={cn(
                      "group relative cursor-pointer transition-all w-full",
                      currentListId === list.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-muted/80",
                      "rounded-lg px-4 py-3 border-2",
                      currentListId === list.id && "border-primary",
                      "flex items-center justify-between"
                    )}
                    onClick={() => selectList(list)}
                  >
                    <div className="flex items-center gap-3">
                      <Gift className="h-5 w-5" />
                      {editingListId === list.id ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="h-8 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveTitle(list);
                              if (e.key === 'Escape') cancelEditing();
                            }}
                            autoFocus
                          />
                          <Button size="sm" onClick={() => saveTitle(list)}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium">{list.list_title}</span>
                          <Badge variant="secondary" className="ml-2">
                            {selectedYear}
                          </Badge>
                        </>
                      )}
                    </div>
                    
                    {editingListId !== list.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(list);
                        }}
                        className={cn(
                          "h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                          currentListId === list.id && "text-primary-foreground hover:text-primary-foreground"
                        )}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Gift List Content */}
        {selectedList && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedList.list_title}
              </h2>
            </div>

            {/* Gift Card Component */}
            <GiftCard 
              initialData={selectedList}
              onSave={loadGiftLists}
            />
          </div>
        )}

        {/* Etsy Products Section */}
        <EtsyProducts shopName="The90sKidShop" />

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
                  <p className="text-sm text-gray-600">Use separate lists for different occasions like holidays, birthdays, or anniversaries.</p>
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
        pageContext="This is the Gifts page where users can select from 4 predefined gift lists (Gift List 1-4) for different occasions. Each list allows users to enter gift ideas, prices, and URLs. Users can edit the titles of each list and all data is saved by year and household. The AI assistant can help fill out gift information."
        pageName="Gifts"
      />
    </div>
  );
}
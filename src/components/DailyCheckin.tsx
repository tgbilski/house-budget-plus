import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Calendar, DollarSign, Smile, Meh, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DailyCheckin {
  id: string;
  date: string;
  amount?: number;
  category?: string;
  description?: string;
  mood_score?: number;
}

interface Streak {
  current_streak: number;
  longest_streak: number;
}

export const DailyCheckin: React.FC = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const { currency } = useCurrency();
  
  const formatCurrency = (amount: number) => {
    return `${currency.symbol}${amount.toFixed(2)}`;
  };
  const { toast } = useToast();
  
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<DailyCheckin[]>([]);
  const [streak, setStreak] = useState<Streak>({ current_streak: 0, longest_streak: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    mood_score: ''
  });

  const categories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 
    'Bills & Utilities', 'Healthcare', 'Groceries', 'Other'
  ];

  const moodIcons = [
    { value: 1, icon: Frown, label: 'Poor', color: 'text-red-500' },
    { value: 2, icon: Frown, label: 'Fair', color: 'text-orange-500' },
    { value: 3, icon: Meh, label: 'Good', color: 'text-yellow-500' },
    { value: 4, icon: Smile, label: 'Great', color: 'text-green-500' },
    { value: 5, icon: Smile, label: 'Excellent', color: 'text-emerald-500' }
  ];

  useEffect(() => {
    if (user && currentHousehold) {
      fetchData();
    }
  }, [user, currentHousehold]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's checkin
      const { data: todayData } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('household_id', currentHousehold?.id)
        .eq('date', today)
        .single();

      setTodayCheckin(todayData);

      // Fetch recent checkins
      const { data: recentData } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('household_id', currentHousehold?.id)
        .order('date', { ascending: false })
        .limit(7);

      setRecentCheckins(recentData || []);

      // Fetch streak data
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', user.id)
        .eq('streak_type', 'daily_checkin')
        .single();

      setStreak(streakData || { current_streak: 0, longest_streak: 0 });

    } catch (error) {
      console.error('Error fetching checkin data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const amount = formData.amount ? parseFloat(formData.amount) : null;
      const moodScore = formData.mood_score ? parseInt(formData.mood_score) : null;

      const checkinData = {
        user_id: user.id,
        household_id: currentHousehold?.id,
        date: today,
        amount,
        category: formData.category || null,
        description: formData.description || null,
        mood_score: moodScore
      };

      // Upsert checkin
      const { error } = await supabase
        .from('daily_checkins')
        .upsert(checkinData, { onConflict: 'user_id,date,household_id' });

      if (error) throw error;

      // Update streak
      const { error: streakError } = await supabase
        .rpc('update_user_streak', {
          _user_id: user.id,
          _streak_type: 'daily_checkin'
        });

      if (streakError) console.error('Streak update error:', streakError);

      toast({
        title: "Daily check-in saved!",
        description: "Great job staying consistent with your financial tracking.",
      });

      // Reset form and refresh data
      setFormData({ amount: '', category: '', description: '', mood_score: '' });
      fetchData();

    } catch (error) {
      console.error('Error saving checkin:', error);
      toast({
        title: "Error saving check-in",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMoodIcon = (score: number) => {
    const mood = moodIcons.find(m => m.value === score);
    if (!mood) return null;
    const Icon = mood.icon;
    return <Icon className={`h-4 w-4 ${mood.color}`} />;
  };

  return (
    <div className="space-y-6">
      {/* Streak Display */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daily Check-in Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{streak.current_streak}</div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{streak.longest_streak}</div>
              <div className="text-sm text-muted-foreground">Best Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Check-in */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Check-in
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayCheckin ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ✓ Completed
                </Badge>
                {todayCheckin.mood_score && getMoodIcon(todayCheckin.mood_score)}
              </div>
              {todayCheckin.amount && (
                <p className="text-sm">
                  <span className="font-medium">Amount:</span> {formatCurrency(todayCheckin.amount)}
                </p>
              )}
              {todayCheckin.category && (
                <p className="text-sm">
                  <span className="font-medium">Category:</span> {todayCheckin.category}
                </p>
              )}
              {todayCheckin.description && (
                <p className="text-sm">
                  <span className="font-medium">Note:</span> {todayCheckin.description}
                </p>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTodayCheckin(null)}
              >
                Edit Today's Check-in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount Spent (Optional)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>How was your financial day?</Label>
                <div className="flex gap-2 mt-2">
                  {moodIcons.map((mood) => {
                    const Icon = mood.icon;
                    return (
                      <Button
                        key={mood.value}
                        type="button"
                        variant={formData.mood_score === mood.value.toString() ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, mood_score: mood.value.toString() }))}
                        className="flex items-center gap-1"
                      >
                        <Icon className={`h-4 w-4 ${mood.color}`} />
                        <span className="text-xs">{mood.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Quick Note (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Any thoughts about today's spending or financial goals?"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Saving...' : 'Complete Today\'s Check-in'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Recent Check-ins */}
      {recentCheckins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCheckins.slice(0, 5).map((checkin) => (
                <div key={checkin.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">
                      {new Date(checkin.date).toLocaleDateString()}
                    </div>
                    {checkin.mood_score && getMoodIcon(checkin.mood_score)}
                  </div>
                  <div className="text-right">
                    {checkin.amount && (
                      <div className="text-sm font-medium">{formatCurrency(checkin.amount)}</div>
                    )}
                    {checkin.category && (
                      <div className="text-xs text-muted-foreground">{checkin.category}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
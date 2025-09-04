import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useHouseholdContext } from '@/providers/HouseholdProvider';
import { toast } from 'sonner';

export type BadgeType = 
  | 'ai_insights'
  | 'compare_vendors'
  | 'financial_resources'
  | 'gifts'
  | 'monthly_budget'
  | 'savings_tracker'
  | 'vacation';

export interface Badge {
  id: string;
  badge_type: BadgeType;
  earned_at: string;
}

export interface BadgeInfo {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const BADGE_INFO: Record<BadgeType, BadgeInfo> = {
  ai_insights: {
    type: 'ai_insights',
    name: 'AI Explorer',
    description: 'Used AI Insights to analyze your budget',
    icon: '🤖',
    color: 'from-purple-500 to-pink-500'
  },
  compare_vendors: {
    type: 'compare_vendors',
    name: 'Smart Shopper',
    description: 'Compared vendors to find the best deals',
    icon: '🛍️',
    color: 'from-blue-500 to-cyan-500'
  },
  financial_resources: {
    type: 'financial_resources',
    name: 'Financial Guru',
    description: 'Explored financial resources and tips',
    icon: '📚',
    color: 'from-green-500 to-emerald-500'
  },
  gifts: {
    type: 'gifts',
    name: 'Gift Master',
    description: 'Created and managed gift lists',
    icon: '🎁',
    color: 'from-red-500 to-pink-500'
  },
  monthly_budget: {
    type: 'monthly_budget',
    name: 'Budget Pro',
    description: 'Created a comprehensive monthly budget',
    icon: '💰',
    color: 'from-yellow-500 to-orange-500'
  },
  savings_tracker: {
    type: 'savings_tracker',
    name: 'Savings Champion',
    description: 'Started tracking savings goals and progress',
    icon: '🎯',
    color: 'from-green-500 to-emerald-500'
  },
  vacation: {
    type: 'vacation',
    name: 'Travel Planner',
    description: 'Planned vacation expenses and budget',
    icon: '✈️',
    color: 'from-teal-500 to-blue-500'
  }
};

export const useBadges = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHouseholdContext();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBadges = async () => {
    if (!user || !currentHousehold) {
      setBadges([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .eq('household_id', currentHousehold.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const earnBadge = async (badgeType: BadgeType) => {
    if (!user || !currentHousehold) return;

    // Check if badge already earned
    const hasEarned = badges.some(badge => badge.badge_type === badgeType);
    if (hasEarned) return;

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: user.id,
          household_id: currentHousehold.id,
          badge_type: badgeType
        })
        .select()
        .single();

      if (error) throw error;

      setBadges(prev => [data, ...prev]);
      
      const badgeInfo = BADGE_INFO[badgeType];
      toast.success(`🎉 Badge Earned: ${badgeInfo.name}!`, {
        description: badgeInfo.description
      });
    } catch (error) {
      console.error('Error earning badge:', error);
    }
  };

  const hasBadge = (badgeType: BadgeType) => {
    return badges.some(badge => badge.badge_type === badgeType);
  };

  const getBadgeProgress = () => {
    const totalBadges = Object.keys(BADGE_INFO).length;
    const earnedBadges = badges.length;
    return {
      earned: earnedBadges,
      total: totalBadges,
      percentage: Math.round((earnedBadges / totalBadges) * 100)
    };
  };

  useEffect(() => {
    fetchBadges();
  }, [user, currentHousehold]);

  return {
    badges,
    loading,
    earnBadge,
    hasBadge,
    getBadgeProgress,
    fetchBadges
  };
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { useYear } from '@/hooks/useYear';
import { useToast } from '@/hooks/use-toast';

export interface Gift {
  id: string;
  user_id: string;
  household_id: string | null;
  occasion: string;
  recipient: string;
  gift_idea: string | null;
  price: number | null;
  link: string | null;
  notes: string | null;
  purchased: boolean;
  year: number;
  created_at: string;
  updated_at: string;
}

export type GiftInsert = Omit<Gift, 'id' | 'created_at' | 'updated_at'>;
export type GiftUpdate = Partial<GiftInsert>;

export const US_HOLIDAYS = [
  "Birthday",
  "Christmas",
  "Easter",
  "Father's Day",
  "Fourth of July",
  "Graduation",
  "Halloween",
  "Hanukkah",
  "Mother's Day",
  "New Year's",
  "Thanksgiving",
  "Valentine's Day",
  "Wedding",
  "Anniversary",
  "Baby Shower",
] as const;

export const useGifts = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { selectedYear } = useYear();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey = ['gifts', currentHousehold?.id, selectedYear];

  const { data: gifts = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('gifts')
        .select('*')
        .eq('year', selectedYear)
        .order('occasion', { ascending: true })
        .order('recipient', { ascending: true });

      if (currentHousehold?.id) {
        query = query.eq('household_id', currentHousehold.id);
      } else {
        query = query.eq('user_id', user.id).is('household_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Gift[];
    },
    enabled: !!user,
  });

  const addGift = useMutation({
    mutationFn: async (gift: Omit<GiftInsert, 'user_id' | 'household_id' | 'year'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('gifts')
        .insert({
          ...gift,
          user_id: user.id,
          household_id: currentHousehold?.id || null,
          year: selectedYear,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Gift added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to add gift', description: error.message, variant: 'destructive' });
    },
  });

  const updateGift = useMutation({
    mutationFn: async ({ id, ...updates }: GiftUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('gifts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Gift updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update gift', description: error.message, variant: 'destructive' });
    },
  });

  const deleteGift = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gifts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Gift deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete gift', description: error.message, variant: 'destructive' });
    },
  });

  const togglePurchased = useMutation({
    mutationFn: async ({ id, purchased }: { id: string; purchased: boolean }) => {
      const { data, error } = await supabase
        .from('gifts')
        .update({ purchased })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast({ title: 'Failed to update gift', description: error.message, variant: 'destructive' });
    },
  });

  return {
    gifts,
    isLoading,
    error,
    addGift,
    updateGift,
    deleteGift,
    togglePurchased,
  };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { first_name?: string | null; last_name?: string | null }) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select('*')
        .maybeSingle();

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      } else {
        setProfile(data);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        return { data };
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error };
    }
  };

  const getInitials = () => {
    if (!profile) return user?.email?.charAt(0).toUpperCase() || 'U';
    
    const first = profile.first_name?.charAt(0).toUpperCase() || '';
    const last = profile.last_name?.charAt(0).toUpperCase() || '';
    
    if (first && last) return first + last;
    if (first) return first;
    if (last) return last;
    
    return profile.email?.charAt(0).toUpperCase() || 'U';
  };

  const truncateEmail = (email: string | null | undefined, maxLength = 15) => {
    if (!email) return '';
    return email.length > maxLength ? `${email.substring(0, maxLength)}...` : email;
  };

  return {
    profile,
    loading,
    updateProfile,
    getInitials,
    truncateEmail,
    refetch: fetchProfile,
  };
}